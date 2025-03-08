import { DeviceInfo } from "@/app/lib/types/session.types";
import SessionModel, { ISession } from "../models/Session.model";
import { SessionRepository } from "../repositories/session.repository";
import { TokensService } from "./tokens.service";
import { AuditAction } from "@/app/lib/types/audit.types";
import { ClientSession } from "mongoose";

export class SessionService {
  private repository = new SessionRepository(SessionModel);
  private tokensService = new TokensService();
  async getSessions(userId: string): Promise<ISession[] | null> {
    return this.repository.getSessions(userId);
  }

  async createSession(
    userId: string,
    deviceInfo: DeviceInfo,
    hashedToken: string,
    expiresAt: Date
  ): Promise<ISession> {
    return this.repository.createSession({
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
    this.tokensService.clearRefreshTokenCookies();
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
    return this.repository.getUserSessions(userId);
  }
}
