import type { Knex } from "knex";

import type {
  QueryBuilderConfig,
  QueryBuilderResult,
} from "@/app/lib/types/queryBuilder.types";
import type {
  IDeviceFingerprintDB,
  ISessionDB,
} from "@/app/lib/types/users.db.types";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";

import { BaseRepository } from "./BaseRepository";

export class SessionRepository extends BaseRepository<ISessionDB> {
  constructor(knex: Knex) {
    super(knex, "user_sessions");
  }
  async getSessions(user_id: string): Promise<ISessionDB[] | null> {
    return await this.query().where("user_id", user_id);
  }

  async findByFingerprint(
    user_id: string,
    fingerprint: IDeviceFingerprintDB["fingerprint"]
  ): Promise<ISessionDB | null> {
    return (await this.query()
      .where("user_id", user_id)
      .join(
        "device_fingerprints",
        "user_sessions.device_id",
        "device_fingerprints._id"
      )
      .where("device_fingerprints.fingerprint", fingerprint)
      .first()) as ISessionDB;
  }
  async revokeSession(id: string): Promise<ISessionDB | null> {
    return await this.query().where("_id", id).update({
      is_active: false,
      revoked_at: new Date(),
    });
  }
  async revokeAllSessions(
    user_id: string,

    trx?: Knex.Transaction
  ): Promise<void> {
    await this.query(trx).where("user_id", user_id).update({
      is_active: false,
      revoked_at: new Date(),
    });
  }
  async isFirstLoginFromDevice(
    user_id: string,
    fingerprint: IDeviceFingerprintDB["fingerprint"]
  ): Promise<boolean> {
    return !!(await this.query()
      .where("user_id", user_id)
      .join(
        "device_fingerprints",
        "user_sessions.device_id",
        "device_fingerprints._id"
      )
      .where("device_fingerprints.fingerprint", fingerprint)
      .where("user_sessions.is_active", true)
      .where("user_sessions.expires_at", ">", new Date()));
  }
  async findActiveToken(user_id: string, hashed_token: string) {
    return await this.query()
      .where("user_id", user_id)
      .where("hashed_token", hashed_token)
      .where("is_active", true)
      .where("expires_at", ">", new Date())
      .first();
  }
  async updateLastUsedAt(id: string) {
    return await this.query().where("_id", id).update({
      last_used_at: new Date(),
    });
  }
  async getUserSessions(
    user_id: string
  ): Promise<QueryBuilderResult<ISessionDB>> {
    const queryConfig: QueryBuilderConfig<ISessionDB> = {
      allowedFilters: ["user_id", "expires_at", "created_at", "last_used_at"],
      allowedSorts: ["created_at", "expires_at", "last_used_at"],
      // excludeFields: ["user_id"],
      selectFields: [
        "_id",
        "user_id",
        "device_id",
        "hashed_token",
        "is_active",
        "expires_at",
        "last_used_at",
        "revoked_at",
        "created_at",
      ],
      totalCountBy: ["user_id"],
    };

    const query = new URLSearchParams();
    query.set("user_id", user_id);
    const queryBuilder = new QueryBuilder<ISessionDB>(
      this.knex,
      this.tableName,
      query,
      queryConfig,
      true
    )
      .join({
        table: "device_fingerprints",
        type: "inner",
        on: {
          left: "device_id",
          right: "_id",
        },
        outerKey: "fingerprint",
        // select: [
        //   "_id",
        //   "ip",
        //   "is_bot",
        //   "location_city",
        //   "location_country",
        //   "location_latitude",
        //   "location_longitude",
        //   "location_source",
        //   "fingerprint",
        // ],
      })
      .join({
        table: "device_details",
        type: "inner",
        on: { left: "device_fingerprints.fingerprint", right: "fingerprint" },
        outerKey: "device_details",
        // select: ["os", "browser", "device", "brand", "model", "fingerprint"],
      })
      .aggregate(
        [
          `COALESCE(json_build_object(
              'os', device_details.os,
              'browser', device_details.browser,
              'device', device_details.device,
              'brand', device_details.brand,
              'model', device_details.model,
              'fingerprint', device_details.fingerprint,
              'ip', device_fingerprints.ip,
              'is_bot', device_fingerprints.is_bot,
              'location', json_build_object(
                'city', device_fingerprints.location_city,
                'country', device_fingerprints.location_country,
                'latitude', device_fingerprints.location_latitude,
                'longitude', device_fingerprints.location_longitude,
                'source', device_fingerprints.location_source
              )
            ), '{}'::json) AS device_info`,
        ],
        [
          "user_sessions._id",
          "user_sessions.user_id",
          "user_sessions.device_id",
          "user_sessions.hashed_token",
          "user_sessions.is_active",
          "user_sessions.expires_at",
          "user_sessions.last_used_at",
          "user_sessions.revoked_at",
          "user_sessions.created_at",

          "device_fingerprints._id",
          "device_fingerprints.ip",
          "device_fingerprints.is_bot",
          "device_fingerprints.location_city",
          "device_fingerprints.location_country",
          "device_fingerprints.location_latitude",
          "device_fingerprints.location_longitude",
          "device_fingerprints.location_source",
          "device_fingerprints.fingerprint",
          "device_details.os",
          "device_details.browser",
          "device_details.device",
          "device_details.brand",
          "device_details.model",
          "device_details.fingerprint",
          // "user_sessions.device_id",
          // "user_sessions.hashed_token",
        ]
        // [
        //   "user_sessions._id",
        //   "user_sessions.user_id",
        //   "user_sessions.device_id",
        //   "user_sessions.hashed_token",
        //   "user_sessions.is_active",
        //   "user_sessions.expires_at",
        //   "user_sessions.last_used_at",
        //   "user_sessions.revoked_at",
        //   "user_sessions.created_at",
        //   // REMOVE the rest — no need to group by device_* if it's only in JSON
        // ]
      );

    return await queryBuilder.execute();
  }
}
