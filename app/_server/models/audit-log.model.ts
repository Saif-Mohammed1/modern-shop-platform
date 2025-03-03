// audit-log.model.ts
import { Document, Schema, model, models, Types } from "mongoose";
import { IUser } from "./User.model";
import { IProduct } from "./Product.model";

export interface IAuditLog extends Document {
  actor: Types.ObjectId | IUser;
  action: "CREATE" | "UPDATE" | "DELETE" | "IMAGE_DELETE";
  entityType: "Product";
  entityId: Types.ObjectId | IProduct;
  timestamp: Date;
  changes: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "IMAGE_DELETE"],
      required: true,
    },
    entityType: { type: String, required: true, default: "Product" },
    entityId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    changes: { type: Schema.Types.Mixed, required: true },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);
AuditLogSchema.index({ entityId: 1, timestamp: -1 });
AuditLogSchema.index({ actor: 1, timestamp: -1 });
AuditLogSchema.set("toObject", { versionKey: false });
export const AuditLogModel =
  models.AuditLog || model<IAuditLog>("AuditLog", AuditLogSchema);
