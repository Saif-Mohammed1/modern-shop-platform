import type { Knex } from "knex";

import type { DeviceInfo } from "@/app/lib/types/session.types";
import {
  type IDeviceDetailsDB,
  type IDeviceFingerprintDB,
} from "@/app/lib/types/users.db.types";
// import { generateUUID } from "@/app/lib/utilities/id";

// type id = Schema.Types.ObjectId;
interface Repository<T> {
  find(filter?: Partial<T>, trx?: Knex.Transaction): Promise<T>;
  findById(id: string, trx?: Knex.Transaction): Promise<T | null>;
  create(data: T, trx?: Knex.Transaction): Promise<T>;
  update(
    id: string,
    data: Partial<T>,
    trx?: Knex.Transaction
  ): Promise<T | null>;
  delete(id: string, trx?: Knex.Transaction): Promise<boolean>;
  transaction<U>(callback: (trx: Knex.Transaction) => Promise<U>): Promise<U>;
}
interface IUpdates {
  [key: string]: any;
}

interface ICleanedUpdates {
  [key: string]: any;
}
export abstract class BaseRepository<
  T extends Record<string, any>, // Adding a constraint to T
> implements Repository<T>
{
  constructor(
    protected readonly knex: Knex,
    protected readonly tableName: string
  ) {}
  protected query(trx?: Knex.Transaction) {
    return trx ? trx<T>(this.tableName) : this.knex<T>(this.tableName);
  }
  async find(filter: Partial<T> = {}, trx?: Knex.Transaction): Promise<T> {
    return (await this.query(trx).where(filter).first()) as T;
  }

  async findById(id: string, trx?: Knex.Transaction): Promise<T | null> {
    const result = await this.query(trx).where("_id", id).first();
    return (result ?? null) as T | null;
  }

  async create(
    // data: T,
    data: Omit<T, "created_at" | "updated_at">,
    trx?: Knex.Transaction
  ): Promise<T> {
    const [docs] = await this.query(trx)
      .insert(data as any)
      .returning("*");

    // const docs = await this.query(trx).where("_id", id).first();
    return docs as T;
  }

  async update(
    id: string,
    data: Partial<T>,
    trx?: Knex.Transaction
  ): Promise<T | null> {
    const cleanedData = this.cleanedUpdates(data);
    const affectedRows = await this.query(trx)
      .where("_id", id)
      .update(cleanedData as any);
    if (affectedRows === 0) {
      return null;
    }
    const update = await this.query(trx).where("_id", id).first();
    return (update ?? null) as T | null;
  }

  async delete(id: string, trx?: Knex.Transaction): Promise<boolean> {
    const result = await this.query(trx).where("_id", id).del();

    return result === 1;
  }
  cleanedUpdates(updates: IUpdates): ICleanedUpdates {
    return Object.fromEntries(
      // Object.entries(updates).filter(([_, v]) => !!v) // this will remove all falsy values
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
  }
  async createDeviceFingerprintDB(
    device_info: DeviceInfo & {
      _id: string;
      user_id: string;
      source: "login_history" | "audit_log" | "user_sessions";
    },
    trx?: Knex.Transaction
  ): Promise<void> {
    const q = trx ?? this.knex;
    const device: Omit<IDeviceFingerprintDB, "created_at" | "updated_at"> = {
      _id: device_info._id,
      user_id: device_info.user_id,

      is_bot: device_info.is_bot,
      source: device_info.source,
      ip: device_info.ip,
      location_city: device_info.location.city,
      location_country: device_info.location.country,
      location_latitude: device_info.location.latitude,
      location_longitude: device_info.location.longitude,
      location_source: "ip",
      fingerprint: device_info.fingerprint,
    };
    // 2. Insert or ignore device details
    await q<IDeviceDetailsDB>("device_details")
      .insert({
        fingerprint: device_info.fingerprint,
        os: device_info.os || "Unknown",
        browser: device_info.browser || "Unknown",
        device: device_info.device || "Unknown",
        brand: device_info.brand ?? null,
        model: device_info.model ?? null,
      })
      .onConflict("fingerprint")
      .merge();

    // mysql
    //     `
    //   INSERT INTO device_details (
    //     fingerprint, os, browser, device, brand, model
    //   ) VALUES (?, ?, ?, ?, ?, ?)
    //   ON DUPLICATE KEY UPDATE
    //     os = VALUES(os),
    //     browser = VALUES(browser),
    //     device = VALUES(device)
    // `,
    //     [
    //       device_info.fingerprint,
    //       device_info.os || "Unknown",
    //       device_info.browser || "Unknown",
    //       device_info.device || "Unknown",
    //       device_info.brand ?? null,
    //       device_info.model ?? null,
    //     ]
    //   );
    // 3. Insert fingerprint relationship
    await q<IDeviceFingerprintDB>("device_fingerprints").insert(device);
  }
  // async createDeviceFingerprintDB(
  //   device_info: DeviceInfo & {
  //     _id: string;
  //     user_id: string;
  //     source: "login_history" | "audit_log" | "user_sessions";
  //   },
  //   trx?: Knex.Transaction
  // ): Promise<void> {
  //   const q = trx ?? this.knex;
  //   const device: Omit<
  //     IDeviceFingerprintDB,
  //     "created_at" | "updated_at" | "brand" | "model"
  //   > & {
  //     brand?: string;
  //     model?: string;
  //   } = {
  //     _id: device_info._id,
  //     user_id: device_info.user_id,
  //     os: device_info.os,
  //     browser: device_info.browser,
  //     device: device_info.device,
  //     brand: device_info.brand,
  //     model: device_info.model,
  //     is_bot: device_info.is_bot,
  //     source: device_info.source,
  //     ip: device_info.ip,
  //     location_city: device_info.location.city,
  //     location_country: device_info.location.country,
  //     location_latitude: device_info.location.latitude,
  //     location_longitude: device_info.location.longitude,
  //     location_source: "ip",
  //     fingerprint: device_info.fingerprint,
  //   };
  //   await q<IDeviceFingerprintDB>("device_fingerprints").insert(device);
  // }
  protected safeJson(value: any) {
    // Convert undefined to null, and keep everything else
    return JSON.stringify(value);
  }
  async transaction<U>(
    callback: (trx: Knex.Transaction) => Promise<U>
  ): Promise<U> {
    return this.knex.transaction<U>(callback);
  }
}
