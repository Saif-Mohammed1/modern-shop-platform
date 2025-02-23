import { DeviceInfo } from "@/app/lib/types/session.types";
import { ISession } from "../models/Session.model";
import { BaseRepository } from "./BaseRepository";
import { Model } from "mongoose";

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
    return this.model.find({ userId }).lean();
  }
  async createSession(dto: CreateSessionDTO): Promise<ISession> {
    return this.model.create(dto);
  }

  async findById(id: string): Promise<ISession | null> {
    return this.model.findById(id).lean();
  }
  async findByFingerprint(
    fingerprint: ISession["deviceInfo"]["fingerprint"]
  ): Promise<ISession | null> {
    return this.model
      .findOne({
        "deviceInfo.fingerprint": fingerprint,
      })
      .lean();
  }
  async revokeSession(id: string): Promise<ISession | null> {
    return this.model.findByIdAndUpdate(id, {
      $set: { isActive: false, revokedAt: new Date() },
    });
  }
  async revokeAllSessions(userId: string): Promise<void> {
    await this.model.updateMany(
      { userId },
      { $set: { isActive: false, revokedAt: new Date() } }
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
    return this.model
      .findOne({
        userId,
        hashedToken,
        isActive: true,
        expiresAt: { $gt: new Date() },
      })
      .lean();
  }
  async updateLastUsedAt(id: string) {
    return this.model.findByIdAndUpdate(id, {
      $set: { lastUsedAt: new Date() },
    });
  }
  async getUserSessions(userId: string): Promise<ISession[]> {
    return this.model.find({ userId }).lean();
  }
}
