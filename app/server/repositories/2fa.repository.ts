// Ithis.model.repository.ts

import type { ClientSession, FilterQuery, Model, UpdateQuery } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import type { AuditLog, ITwoFactorAuth } from "../models/2fa.model";

export class TwoFactorRepository extends BaseRepository<ITwoFactorAuth> {
  constructor(model: Model<ITwoFactorAuth>) {
    super(model);
  }
  override async create(
    dto: Omit<ITwoFactorAuth, "_id" | "createdAt" | "updatedAt">,
    // dto: Partial<ITwoFactorAuth>,
    session?: ClientSession
  ): Promise<ITwoFactorAuth> {
    const [TwoFactor] = await this.model.create([dto], {
      session,
    });
    return TwoFactor;
  }
  override async update(
    id: string,
    data: Partial<ITwoFactorAuth>,
    session?: ClientSession
  ): Promise<ITwoFactorAuth | null> {
    const TwoFactor = await this.model.findOneAndUpdate(
      { _id: id, userId: data.userId },
      { $set: data },
      { new: true, session }
    );
    return TwoFactor;
  }
  async deleteTwoFactor(
    userId: string,
    session?: ClientSession
  ): Promise<boolean> {
    const result = await this.model.deleteOne({ userId }, { session });
    return result.deletedCount === 1;
  }

  async findOne(
    filter: FilterQuery<ITwoFactorAuth>,
    options?: { select?: string }
  ) {
    return await this.model
      .findOne(filter)
      .select(options?.select || "")
      .lean();
  }

  async findOneAndUpdate(
    filter: FilterQuery<ITwoFactorAuth>,
    update: UpdateQuery<ITwoFactorAuth>,
    session?: ClientSession
  ) {
    return await this.model
      .findOneAndUpdate(filter, update, { new: true, session })
      .lean();
  }

  async addAuditLog(userId: string, log: AuditLog) {
    return await this.model.updateOne(
      { userId },
      { $push: { auditLogs: log } }
    );
  }

  async updateBackupCodes(
    userId: string,
    backupCodes: string[],
    session?: ClientSession
  ) {
    return await this.model.updateOne(
      { userId },
      { $set: { backupCodes } },
      { session }
    );
  }

  async incrementRecoveryAttempts(userId: string) {
    return await this.model.updateOne(
      { userId },
      { $inc: { recoveryAttempts: 1 }, $set: { lastUsed: new Date() } }
    );
  }

  async resetRecoveryAttempts(userId: string) {
    return await this.model.updateOne(
      { userId },
      { $set: { recoveryAttempts: 0, lastUsed: null } }
    );
  }
  async startSession(): Promise<ClientSession> {
    return await this.model.db.startSession();
  }
}
