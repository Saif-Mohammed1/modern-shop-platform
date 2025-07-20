import { UserRole } from "@/app/lib/types/users.db.types";
import AppError from "@/app/lib/utilities/appError";

import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { RefundService } from "../../services/refund.service";
import type { Context } from "../apollo-server";

const refundService: RefundService = new RefundService();

interface CreateRefundInput {
  invoice_id: string;
  reason: string;
  amount: number;
}

interface UpdateRefundStatusInput {
  status: string;
  notes?: string;
}

export const refundResolvers = {
  Query: {
    getRefunds: async (
      _parent: unknown,
      {
        page = 1,
        limit = 10,
        status,
      }: { page?: number; limit?: number; status?: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );

      const options = {
        page,
        limit,
        status,
      };

      return await refundService.getRefunds(options);
    },

    getRefundById: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );

      const refund = await refundService.getRefundById(id);
      if (!refund) {
        throw new AppError("Refund not found", 404);
      }

      return refund;
    },

    getUserRefunds: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const userId = req.user?._id.toString()!;

      return await refundService.getUserRefunds(userId);
    },
  },

  Mutation: {
    createRefundRequest: async (
      _parent: unknown,
      { input }: { input: CreateRefundInput },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const userId = req.user?._id.toString()!;

      const refundData = {
        ...input,
        user_id: userId,
      };

      return await refundService.createRefundRequest(refundData);
    },

    updateRefundStatus: async (
      _parent: unknown,
      { id, input }: { id: string; input: UpdateRefundStatusInput },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const processedBy = req.user?._id.toString()!;

      return await refundService.updateRefundStatus(
        id,
        input.status,
        input.notes,
        processedBy
      );
    },

    deleteRefund: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );

      await refundService.deleteRefund(id);

      return {
        message: "Refund deleted successfully",
      };
    },
  },
};
