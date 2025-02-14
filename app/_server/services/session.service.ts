import { DeviceInfo } from "@/app/lib/types/refresh.types";
import SessionModel, { ISession } from "../models/Session.model";
import { SessionRepository } from "../repositories/session.repository";
import { IUser } from "../models/User.model";

export class SessionService {
  private repository = new SessionRepository(SessionModel);
  async getSessions(userId: IUser["_id"]): Promise<ISession[] | null> {
    return this.repository.getSessions(userId);
  }

  async createSession(
    userId: IUser["_id"],
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

  async revokeSession(sessionId: ISession["_id"]): Promise<void> {
    this.repository.revokeSession(sessionId);
  }

  async revokeAllSessions(userId: IUser["_id"]): Promise<void> {
    this.repository.revokeAllSessions(userId);
  }
}
