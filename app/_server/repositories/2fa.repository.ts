// Ithis.model.repository.ts

import { ClientSession, FilterQuery, Model, UpdateQuery } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { AuditLog, ITwoFactorAuth } from "../models/2fa.model";

export class TwoFactorRepository extends BaseRepository<ITwoFactorAuth> {
  constructor(model: Model<ITwoFactorAuth>) {
    super(model);
  }
  async create(
    dto: Partial<ITwoFactorAuth>,
    session?: ClientSession
  ): Promise<ITwoFactorAuth> {
    const [TwoFactor] = await this.model.create([dto], {
      session,
    });
    return TwoFactor;
  }
  async update(
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
    return this.model
      .findOne(filter)
      .select(options?.select || "")
      .lean();
  }

  async findOneAndUpdate(
    filter: FilterQuery<ITwoFactorAuth>,
    update: UpdateQuery<ITwoFactorAuth>
  ) {
    return this.model.findOneAndUpdate(filter, update, { new: true }).lean();
  }

  async addAuditLog(userId: string, log: AuditLog) {
    return this.model.updateOne({ userId }, { $push: { auditLogs: log } });
  }

  async updateBackupCodes(
    userId: string,
    backupCodes: string[],
    session?: ClientSession
  ) {
    return this.model.updateOne(
      { userId },
      { $set: { backupCodes } },
      { session }
    );
  }

  async incrementRecoveryAttempts(userId: string) {
    return this.model.updateOne(
      { userId },
      { $inc: { recoveryAttempts: 1 }, $set: { lastUsed: new Date() } }
    );
  }

  async resetRecoveryAttempts(userId: string) {
    return this.model.updateOne(
      { userId },
      { $set: { recoveryAttempts: 0, lastUsed: null } }
    );
  }
  async startSession(): Promise<ClientSession> {
    return this.model.db.startSession();
  }
}
