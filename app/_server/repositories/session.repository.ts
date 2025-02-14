import { ISession } from "../models/Session.model";
import { IUser } from "../models/User.model";
import { BaseRepository } from "./BaseRepository";
import { Model } from "mongoose";

interface CreateSessionDTO {
  userId: ISession["userId"];
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
  async getSessions(userId: ISession["_id"]): Promise<ISession[] | null> {
    return this.model.find({ userId });
  }
  async createSession(dto: CreateSessionDTO): Promise<ISession> {
    return this.model.create(dto);
  }

  async findById(id: ISession["_id"]): Promise<ISession | null> {
    return this.model.findById(id);
  }
  async findByFingerprint(
    fingerprint: ISession["deviceInfo"]["fingerprint"]
  ): Promise<ISession | null> {
    return this.model.findOne({
      "deviceInfo.fingerprint": fingerprint,
    });
  }
  async revokeSession(id: ISession["_id"]): Promise<ISession | null> {
    return this.model.findByIdAndUpdate(id, {
      $set: { isActive: false, revokedAt: new Date() },
    });
  }
  async revokeAllSessions(userId: IUser["_id"]): Promise<void> {
    await this.model.updateMany(
      { userId },
      { $set: { isActive: false, revokedAt: new Date() } }
    );
  }
}
