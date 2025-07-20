import { z } from "zod";

import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";

// Translation imports would go here - using generic messages for now
const refundMessages = {
  userIdRequired: "User ID is required",
  invoiceIdRequired: "Invoice ID is required",
  invoiceIdInvalid: "Invalid invoice ID format",
  reasonRequired: "Reason is required",
  reasonMinLength: "Reason must be at least 10 characters",
  reasonMaxLength: "Reason cannot exceed 500 characters",
  issueRequired: "Issue description is required",
  issueMinLength: "Issue description must be at least 5 characters",
  issueMaxLength: "Issue description cannot exceed 200 characters",
  amountRequired: "Amount is required",
  amountPositive: "Amount must be positive",
  amountMax: "Amount cannot exceed 10000",
  statusInvalid: "Status must be pending, approved, or rejected",
  notesMaxLength: "Notes cannot exceed 1000 characters",
};

export class RefundValidation {
  static createRefundSchema = z.object({
    user_id: zObjectId.optional(), // Will be set from auth context
    invoice_id: z
      .string({
        required_error: refundMessages.invoiceIdRequired,
      })
      .trim()
      .min(1, refundMessages.invoiceIdRequired)
      .regex(/^[A-Za-z0-9-_]+$/, refundMessages.invoiceIdInvalid),

    reason: z
      .string({
        required_error: refundMessages.reasonRequired,
      })
      .trim()
      .min(10, refundMessages.reasonMinLength)
      .max(500, refundMessages.reasonMaxLength),

    issue: z
      .string({
        required_error: refundMessages.issueRequired,
      })
      .trim()
      .min(5, refundMessages.issueMinLength)
      .max(200, refundMessages.issueMaxLength),

    amount: z
      .number({
        required_error: refundMessages.amountRequired,
      })
      .positive(refundMessages.amountPositive)
      .max(10000, refundMessages.amountMax)
      .multipleOf(0.01), // Ensure 2 decimal places for currency
  });

  static updateRefundStatusSchema = z.object({
    status: z.enum(["pending", "approved", "rejected"], {
      errorMap: () => ({ message: refundMessages.statusInvalid }),
    }),
    notes: z
      .string()
      .trim()
      .max(1000, refundMessages.notesMaxLength)
      .optional(),
  });

  static getRefundsQuerySchema = z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().min(1)),

    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .pipe(z.number().min(1).max(100)),

    status: z.enum(["pending", "approved", "rejected"]).optional(),

    user_id: zObjectId.optional(),

    invoice_id: z.string().trim().optional(),

    sort: z
      .enum([
        "created_at",
        "updated_at",
        "amount",
        "-created_at",
        "-updated_at",
        "-amount",
      ])
      .optional()
      .default("created_at"),
  });

  static refundIdSchema = z.object({
    id: zObjectId,
  });

  // Validation methods
  static validateCreateRefund(data: unknown) {
    return this.createRefundSchema.parse(data);
  }

  static validateUpdateRefundStatus(data: unknown) {
    return this.updateRefundStatusSchema.parse(data);
  }

  static validateGetRefundsQuery(data: unknown) {
    return this.getRefundsQuerySchema.parse(data);
  }

  static validateRefundId(data: unknown) {
    return this.refundIdSchema.parse(data);
  }

  // DTO types
  static get CreateRefundDTO() {
    return this.createRefundSchema;
  }

  static get UpdateRefundStatusDTO() {
    return this.updateRefundStatusSchema;
  }

  static get GetRefundsQueryDTO() {
    return this.getRefundsQuerySchema;
  }

  static get RefundIdDTO() {
    return this.refundIdSchema;
  }
}

// Export types for use in services and controllers
export type CreateRefundDTO = z.infer<
  typeof RefundValidation.createRefundSchema
>;
export type UpdateRefundStatusDTO = z.infer<
  typeof RefundValidation.updateRefundStatusSchema
>;
export type GetRefundsQueryDTO = z.infer<
  typeof RefundValidation.getRefundsQuerySchema
>;
export type RefundIdDTO = z.infer<typeof RefundValidation.refundIdSchema>;
