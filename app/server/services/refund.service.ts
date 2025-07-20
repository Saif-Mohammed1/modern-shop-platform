import logger from "@/app/lib/logger/logs";
import type { IRefundDB } from "@/app/lib/types/refund.db.types";
import AppError from "@/app/lib/utilities/appError";
import { generateUUID } from "@/app/lib/utilities/id";

import { connectDB } from "../db/db";
import { RefundRepository } from "../repositories/refund.repository";

export class RefundService {
  constructor(
    private readonly repository: RefundRepository = new RefundRepository(
      connectDB()
    )
  ) {}

  async createRefundRequest(refundData: {
    user_id: string;
    invoice_id: string;
    reason: string;
    amount: number;
    issue?: string;
  }): Promise<IRefundDB> {
    try {
      const newRefund: IRefundDB = {
        _id: generateUUID(),
        user_id: refundData.user_id,
        invoice_id: refundData.invoice_id,
        reason: refundData.reason,
        amount: refundData.amount,
        issue: refundData.issue || "",
        status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const refund = await this.repository.create(newRefund);
      logger.info(
        `Refund created: ${refund._id} for user: ${refundData.user_id}`
      );

      return refund;
    } catch (error) {
      logger.error("Error creating refund:", error);
      throw new AppError("Failed to create refund request", 500);
    }
  }

  async getUserRefunds(userId: string): Promise<IRefundDB[]> {
    try {
      const result = await this.repository.findByUserId(userId);
      return result.docs;
    } catch (error) {
      logger.error("Error fetching user refunds:", error);
      throw new AppError("Failed to fetch refunds", 500);
    }
  }

  async getRefundById(refundId: string): Promise<IRefundDB | null> {
    try {
      return await this.repository.findById(refundId);
    } catch (error) {
      logger.error("Error fetching refund:", error);
      throw new AppError("Failed to fetch refund", 500);
    }
  }

  async getRefunds(options: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    refunds: IRefundDB[];
    total: number;
    hasNext: boolean;
  }> {
    try {
      const result = await this.repository.findWithFilters({
        status: options.status,
        page: options.page || 1,
        limit: options.limit || 10,
      });

      return {
        refunds: result.docs,
        total: result.meta.total,
        hasNext: result.meta.hasNext,
      };
    } catch (error) {
      logger.error("Error fetching all refunds:", error);
      throw new AppError("Failed to fetch refunds", 500);
    }
  }

  async updateRefundStatus(
    refundId: string,
    status: string,
    notes?: string,
    _processedBy?: string
  ): Promise<IRefundDB> {
    try {
      const updatedRefund = await this.repository.updateStatus(
        refundId,
        status,
        notes
      );

      if (!updatedRefund) {
        throw new AppError("Refund not found", 404);
      }

      logger.info(`Refund ${refundId} status updated to: ${status}`);
      return updatedRefund;
    } catch (error) {
      logger.error("Error updating refund status:", error);
      throw new AppError("Failed to update refund status", 500);
    }
  }

  async deleteRefund(refundId: string): Promise<void> {
    try {
      const success = await this.repository.delete(refundId);

      if (!success) {
        throw new AppError("Refund not found", 404);
      }

      logger.info(`Refund deleted: ${refundId}`);
    } catch (error) {
      logger.error("Error deleting refund:", error);
      throw new AppError("Failed to delete refund", 500);
    }
  }

  async getRefundsByInvoiceId(invoiceId: string): Promise<IRefundDB[]> {
    try {
      return await this.repository.findByInvoiceId(invoiceId);
    } catch (error) {
      logger.error("Error fetching refunds by invoice ID:", error);
      throw new AppError("Failed to fetch refunds", 500);
    }
  }

  async getPendingRefunds(): Promise<IRefundDB[]> {
    try {
      return await this.repository.findPendingRefunds();
    } catch (error) {
      logger.error("Error fetching pending refunds:", error);
      throw new AppError("Failed to fetch pending refunds", 500);
    }
  }

  async getRefundStatistics(): Promise<{
    totalRefunds: number;
    pendingRefunds: number;
    approvedRefunds: number;
    rejectedRefunds: number;
    totalRefundAmount: number;
  }> {
    try {
      return await this.repository.getRefundStatistics();
    } catch (error) {
      logger.error("Error fetching refund statistics:", error);
      throw new AppError("Failed to fetch refund statistics", 500);
    }
  }
}
