// // audit-log.model.ts
// import { Document, Schema, model, models, Types } from "mongoose";
// import { IUser } from "./User.model";
// import { IProduct } from "./Product.model";

// export interface IAuditLog extends Document {
//   actor: Types.ObjectId | IUser;
//   action: "CREATE" | "UPDATE" | "DELETE" | "IMAGE_DELETE";
//   entityType: "Product";
//   entityId: Types.ObjectId | IProduct;
//   timestamp: Date;
//   changes: Record<string, any>;
//   ipAddress?: string;
//   userAgent?: string;
// }

// const AuditLogSchema = new Schema<IAuditLog>(
//   {
//     actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     action: {
//       type: String,
//       enum: ["CREATE", "UPDATE", "DELETE", "IMAGE_DELETE"],
//       required: true,
//     },
//     entityType: { type: String, required: true, default: "Product" },
//     entityId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
//     changes: { type: Schema.Types.Mixed, required: true },
//     ipAddress: String,
//     userAgent: String,
//   },
//   {
//     timestamps: true,
//     toJSON: {
//       virtuals: true,
//       transform: (_, ret) => {
//         ["createdAt", "updatedAt"].forEach((field) => {
//           if (ret[field]) {
//             ret[field] = new Date(ret[field]).toISOString().split("T")[0];
//           }
//         });
//         delete ret.__v;
//         return ret;
//       },
//     },
//   }
// );
// AuditLogSchema.index({ entityId: 1, timestamp: -1 });
// AuditLogSchema.index({ actor: 1, timestamp: -1 });
// AuditLogSchema.set("toObject", { versionKey: false });
// export const AuditLogModel =
//   models.AuditLog || model<IAuditLog>("AuditLog", AuditLogSchema);

// audit-log.model.ts
import { Document, Schema, model, models, Types } from "mongoose";
import { IUser } from "./User.model";
import { IProduct } from "./Product.model";
import { Model } from "mongoose";
import {
  AuditAction,
  AuditSource,
  EntityType,
} from "@/app/lib/types/audit.types";

export interface IAuditLog extends Document {
  actor: Types.ObjectId | IUser;
  action: AuditAction;
  entityType: EntityType;
  entityId: String;
  changes: {
    field: string;
    before?: any;
    after?: any;
    changeType: "ADD" | "MODIFY" | "REMOVE";
  }[];
  ipAddress?: string;
  userAgent?: string;
  source: AuditSource;
  correlationId?: string;
  context?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
    },
    entityType: {
      type: String,
      enum: Object.values(EntityType),
      required: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    changes: [
      {
        field: { type: String, required: true },
        before: { type: Schema.Types.Mixed },
        after: { type: Schema.Types.Mixed },
        changeType: {
          type: String,
          enum: ["ADD", "MODIFY", "REMOVE"],
          required: true,
        },
      },
    ],
    ipAddress: {
      type: String,
      match: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
    },
    userAgent: String,
    source: {
      type: String,
      enum: Object.values(AuditSource),
      default: AuditSource.WEB,
    },
    correlationId: String,
    context: Schema.Types.Mixed,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ["createdAt", "updatedAt"].forEach((field) => {
          if (ret[field]) {
            ret[field] = new Date(ret[field]).toISOString().split("T")[0];
          }
        });
        delete ret.__v;
        return ret;
      },
    },
    // Auto-expire logs after 2 years (730 days)
    expireAfterSeconds: 63072000,
  }
);

// Compound indexes for common queries
// Fix timestamp reference to use createdAt
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ actor: 1, entityType: 1, createdAt: -1 });

// Add new indexes for common query patterns
AuditLogSchema.index({ "changes.field": 1, "changes.changeType": 1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
// Middleware example: Auto-add correlation ID for API requests
AuditLogSchema.pre("save", function (next) {
  if (this.source === "API" && !this.correlationId) {
    this.correlationId = `CORR-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
  next();
});

const AuditLogModel: Model<IAuditLog> =
  models.AuditLog || model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLogModel;
