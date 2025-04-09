import type { Model, ClientSession } from "mongoose";

import type {
  QueryBuilderConfig,
  QueryBuilderResult,
} from "@/app/lib/types/queryBuilder.types";
import type { DeviceInfo } from "@/app/lib/types/session.types";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";

import type { ISession } from "../models/Session.model";

import { BaseRepository } from "./BaseRepository";

interface CreateSessionDTO {
  userId: string;
  isActive: ISession["isActive"];
  deviceInfo: ISession["deviceInfo"];
  hashedToken: ISession["hashedToken"];
  revokedAt?: Date;
  expiresAt: Date; // Set session expiration date
}
export class SessionRepository extends BaseRepository<ISession> {
  constructor(model: Model<ISession>) {
    super(model);
  }
  async getSessions(userId: string): Promise<ISession[] | null> {
    return await this.model.find({ userId }).lean();
  }
  async createSession(dto: CreateSessionDTO): Promise<ISession> {
    return await this.model.create(dto);
  }

  override async findById(id: string): Promise<ISession | null> {
    return await this.model.findById(id).lean();
  }
  async findByFingerprint(
    fingerprint: ISession["deviceInfo"]["fingerprint"]
  ): Promise<ISession | null> {
    return await this.model
      .findOne({
        "deviceInfo.fingerprint": fingerprint,
      })
      .lean();
  }
  async revokeSession(id: string): Promise<ISession | null> {
    return await this.model.findByIdAndUpdate(id, {
      $set: { isActive: false, revokedAt: new Date() },
    });
  }
  async revokeAllSessions(
    userId: string,

    session?: ClientSession
  ): Promise<void> {
    await this.model.updateMany(
      { userId },
      { $set: { isActive: false, revokedAt: new Date() } },
      { session }
    );
  }
  async isFirstLoginFromDevice(
    userId: string,
    deviceInfo: DeviceInfo
  ): Promise<boolean> {
    return !(await this.model
      .exists({
        userId,
        "deviceInfo.fingerprint": deviceInfo.fingerprint,
        isActive: true,
      })
      .lean());
  }
  async findActiveToken(userId: string, hashedToken: string) {
    return await this.model
      .findOne({
        userId,
        hashedToken,
        isActive: true,
        expiresAt: { $gt: new Date() },
      })
      .lean();
  }
  async updateLastUsedAt(id: string) {
    return await this.model.findByIdAndUpdate(id, {
      $set: { lastUsedAt: new Date() },
    });
  }
  async getUserSessions(userId: string): Promise<QueryBuilderResult<ISession>> {
    const queryConfig: QueryBuilderConfig<ISession> = {
      allowedFilters: ["userId", "expiresAt", "createdAt", "lastUsedAt"],
      allowedSorts: ["createdAt", "expiresAt", "lastUsedAt"],
      // excludeFields: ["userId"],
    };

    const query = new URLSearchParams();
    query.set("userId", userId);
    const queryBuilder = new QueryBuilder<ISession>(
      this.model,

      query,
      queryConfig
    );

    return await queryBuilder.execute();
  }
  async startSession(): Promise<ClientSession> {
    return await this.model.db.startSession();
  }
}
