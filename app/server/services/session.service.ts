import type { Knex } from "knex";

import type { QueryBuilderResult } from "@/app/lib/types/queryBuilder.types";
import type { DeviceInfo } from "@/app/lib/types/session.types";
import type { ISessionDB } from "@/app/lib/types/users.db.types";
import { generateUUID } from "@/app/lib/utilities/id";

import { connectDB } from "../db/db";
import { SessionRepository } from "../repositories/session.repository";

import { TokensService } from "./tokens.service";

// import { SecurityAuditAction } from "@/app/lib/types/audit.db.types";

export class SessionService {
  constructor(
    private readonly repository: SessionRepository = new SessionRepository(
      connectDB()
    ),
    private readonly tokensService: TokensService = new TokensService()
  ) {}
  async getSessions(user_id: string): Promise<ISessionDB[] | null> {
    return await this.repository.getSessions(user_id);
  }

  async createSession(
    user_id: string,
    device_info: DeviceInfo,
    hashed_token: string,
    expires_at: Date,
    trx?: Knex.Transaction
  ): Promise<ISessionDB> {
    const deviceId = generateUUID();
    const sessionId = generateUUID();
    // const [, session] = await Promise.all([
    await this.repository.createDeviceFingerprintDB(
      {
        ...device_info,
        user_id: user_id,
        _id: deviceId,
        source: "user_sessions",
      },
      trx
    );
    const session = await this.repository.create(
      {
        _id: sessionId,
        user_id: user_id,
        device_id: deviceId,
        expires_at,
        hashed_token,
        is_active: true,
        last_used_at: new Date(Date.now()),
        // created_at: new Date(Date.now()),
        // updated_at: new Date(Date.now()),
      },
      trx
    );
    // ]);
    return session;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.repository.revokeSession(sessionId);
  }

  async revokeAllSessions(user_id: string): Promise<void> {
    await this.repository.revokeAllSessions(user_id);
    await this.tokensService.clearRefreshTokenCookies();
  }
  async revokeAllSessionsByAdmin(
    user_id: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.repository.revokeAllSessions(user_id, trx);
  }
  async validateRefreshToken(
    user_id: string,
    rawToken: string
  ): Promise<boolean> {
    const tokenHash = this.tokensService.hashRefreshToken(rawToken);
    const token = await this.repository.findActiveToken(user_id, tokenHash);

    if (!token) {
      return false;
    }

    // Update last used timestamp
    await this.repository.updateLastUsedAt(String(token._id));

    return true;
  }
  async getUserSessions(
    user_id: string
  ): Promise<QueryBuilderResult<ISessionDB>> {
    return await this.repository.getUserSessions(user_id);
  }
}
