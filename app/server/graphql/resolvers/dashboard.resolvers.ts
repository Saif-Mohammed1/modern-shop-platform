import type { DashboardDataApi } from "@/app/lib/types/dashboard.types";
import { UserRole } from "@/app/lib/types/users.db.types";

import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { DashboardService } from "../../services/dashboard.service";
import type { Context } from "../apollo-server";

const service: DashboardService = new DashboardService();

export const dashboardResolvers = {
  Query: {
    getDashboardData: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      return await service.getMainDashboard();
    },
  },
  UserAnalytics: {
    languageDistribution: (parent: DashboardDataApi["users"]) => {
      const { languageDistribution } = parent;
      if (Array.isArray(languageDistribution)) {
        return languageDistribution;
      }

      // Transform Record<string, number> to array format
      return Object.entries(languageDistribution).map(([language, count]) => ({
        language,
        count: Number(count),
      }));
    },
  },
  OrderAnalytics: {
    fulfillment: (parent: DashboardDataApi["orders"]) => {
      const { fulfillment } = parent;
      return {
        ...fulfillment,
        statusDistribution: Object.entries(
          fulfillment.statusDistribution || {}
        ).map(([status, data]) => ({
          status,
          count: (data as { count: number; avgHours: number }).count,
          avgHours: (data as { count: number; avgHours: number }).avgHours,
        })),
      };
    },
  },
  ReportAnalytics: {
    statusBreakdown: (parent: DashboardDataApi["reports"]) => {
      const { statusBreakdown } = parent;
      if (Array.isArray(statusBreakdown)) {
        return statusBreakdown;
      }

      return Object.entries(statusBreakdown || {}).map(([status, count]) => ({
        status,
        count: Number(count),
      }));
    },
  },
  RefundAnalytics: {
    commonReasons: (parent: DashboardDataApi["refunds"]) => {
      const { commonReasons } = parent;
      return commonReasons.map((reason) => ({
        ...reason,
        reason: reason.reason || "Unknown",
        frequency: reason.frequency || 0,
        financialImpact: reason.financialImpact || 0,
      }));
    },
    weeklyTrend: (parent: DashboardDataApi["refunds"]) => {
      const { weeklyTrend } = parent;
      if (Array.isArray(weeklyTrend)) {
        return weeklyTrend;
      }

      return Object.entries(weeklyTrend || {}).map(([week, data]) => ({
        week,
        data: Object.entries((data as Record<string, number>) || {}).map(
          ([key, value]) => ({
            key,
            value: Number(value),
          })
        ),
      }));
    },
  },
};
