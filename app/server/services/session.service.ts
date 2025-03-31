import type { DeviceInfo } from "@/app/lib/types/session.types";
import SessionModel, { type ISession } from "../models/Session.model";
import { SessionRepository } from "../repositories/session.repository";
import { TokensService } from "./tokens.service";
// import { SecurityAuditAction } from "@/app/lib/types/audit.types";
import type { ClientSession } from "mongoose";

export class SessionService {
  constructor(
    private readonly repository: SessionRepository = new SessionRepository(
      SessionModel
    ),
    private readonly tokensService: TokensService = new TokensService()
  ) {}
  async getSessions(userId: string): Promise<ISession[] | null> {
    return await this.repository.getSessions(userId);
  }

  async createSession(
    userId: string,
    deviceInfo: DeviceInfo,
    hashedToken: string,
    expiresAt: Date
  ): Promise<ISession> {
    return await this.repository.createSession({
      userId,
      deviceInfo,
      expiresAt,
      hashedToken,
      isActive: true,
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    this.repository.revokeSession(sessionId);
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.repository.revokeAllSessions(userId);
    await this.tokensService.clearRefreshTokenCookies();
  }
  async revokeAllSessionsByAdmin(
    userId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.repository.revokeAllSessions(userId, session);
  }
  async validateRefreshToken(
    userId: string,
    rawToken: string
  ): Promise<boolean> {
    const tokenHash = this.tokensService.hashRefreshToken(rawToken);
    const token = await this.repository.findActiveToken(userId, tokenHash);

    if (!token) return false;

    // Update last used timestamp
    await this.repository.updateLastUsedAt(String(token._id));

    return true;
  }
  async getUserSessions(userId: string): Promise<ISession[]> {
    return await this.repository.getUserSessions(userId);
  }
}
