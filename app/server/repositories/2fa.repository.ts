// Ithis.model.repository.ts

import type { Knex } from "knex";

import type {
  IBackupCodesDB,
  ITwoFactorAuthAuditLogDB,
  ITwoFactorAuthDB,
} from "@/app/lib/types/2fa.db.types";
import { generateUUID } from "@/app/lib/utilities/id";

import { BaseRepository } from "./BaseRepository";

export class TwoFactorRepository extends BaseRepository<ITwoFactorAuthDB> {
  constructor(knex: Knex) {
    super(knex, "two_factor_auth");
  }

  async findByUserId(
    user_id: ITwoFactorAuthDB["user_id"]
    // options?: { select?: string }
  ): Promise<ITwoFactorAuthDB | null> {
    return (await this.query().where("user_id", user_id).first()) ?? null;
    // .select(options?.select ?? "");
  }

  async addAuditLog(
    user_id: string,
    log: Omit<ITwoFactorAuthAuditLogDB, "two_factor_auth_id">,
    trx?: Knex.Transaction
  ) {
    const query = trx ?? this.knex;
    return await query<ITwoFactorAuthAuditLogDB>(
      "two_factor_auth_audit_log"
    ).insert({
      _id: log._id,
      two_factor_auth_id: user_id,
      timestamp: log.timestamp,
      action: log.action,
    });
  }
  async getAuditLogs(user_id: string): Promise<ITwoFactorAuthAuditLogDB[]> {
    return await this.knex<ITwoFactorAuthAuditLogDB>(
      "two_factor_auth_audit_log"
    )
      .where("two_factor_auth_id", user_id)
      .orderBy("timestamp", "desc");
  }

  async disableTwoFactorAuth(
    user_id: ITwoFactorAuthDB["user_id"],
    trx?: Knex.Transaction
  ): Promise<boolean> {
    const result = await this.query(trx).where("user_id", user_id).del();
    return result > 0;
  }
  async incrementRecoveryAttempts(user_id: string) {
    return await this.query()
      .where("user_id", user_id)
      .increment("recovery_attempts", 1)
      .update({ last_used: new Date() });
  }

  async resetRecoveryAttempts(user_id: string, trx?: Knex.Transaction) {
    return await this.query(trx)
      .where("user_id", user_id)
      .update({ recovery_attempts: 0 });
  }
  async regenerateBackupCodes(
    codes: string[],
    user_id: ITwoFactorAuthDB["user_id"],
    trx?: Knex.Transaction
  ) {
    const query = trx ?? this.knex;

    await query<IBackupCodesDB>("backup_codes")
      .where("two_factor_auth_id", user_id)
      .del();
    await this.saveBackupCodes(codes, user_id, trx);
  }
  async saveBackupCodes(
    codes: string[],
    user_id: ITwoFactorAuthDB["user_id"],
    trx?: Knex.Transaction
  ) {
    const query = trx ?? this.knex;
    const backupCodes = codes.map((code) => ({
      _id: generateUUID(),
      two_factor_auth_id: user_id,
      code,
      is_used: false,
    }));
    return await query<IBackupCodesDB>("backup_codes").insert(backupCodes);
  }
  async getBackupCodes(
    user_id: ITwoFactorAuthDB["user_id"],
    trx?: Knex.Transaction
  ): Promise<IBackupCodesDB[]> {
    const query = trx ?? this.knex;
    return await query<IBackupCodesDB>("backup_codes")
      .where("two_factor_auth_id", user_id)
      .andWhere("is_used", false);
  }
  async updateBackupCodeStatus(
    codeId: string,
    update: { is_used: boolean },
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    await query<IBackupCodesDB>("backup_codes")
      .where("_id", codeId)
      .update(update);
  }
  async updateBackupCodes(
    user_id: string,
    codes: {
      _id: string;
      is_used: boolean;
    }[], //Partial<IBackupCodesDB>[],
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    const update = codes.map((code) =>
      query<IBackupCodesDB>("backup_codes")
        .where("_id", code._id)
        .andWhere("two_factor_auth_id", user_id)
        .update({
          is_used: true,
          updated_at: new Date(),
        })
    );
    await Promise.all(update);
  }
}
