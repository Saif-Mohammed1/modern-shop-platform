import { SecurityDashboardData } from "@/app/lib/types/security.types";
import { DashboardRepository } from "../repositories/dashboard.repository";

export class SecurityService {
  constructor(
    private readonly repo: DashboardRepository = new DashboardRepository()
  ) {}

  async getSecurityAnalytics(): Promise<void> {
    // const rawData = await this.repo.getSecurityAnalytics();
    // return this.transformData(rawData);
  }
  // async getSecurityAnalytics(): Promise<SecurityDashboardData> {
  //   // const rawData = await this.repo.getSecurityAnalytics();
  //   // return this.transformData(rawData);
  // }

  private transformData(data: SecurityDashboardData): SecurityDashboardData {
    return {
      ...data,
      trends: {
        loginAttempts: data.trends.loginAttempts.slice(-14), // Last 14 days
        securityEvents: data.trends.securityEvents.slice(-14),
      },
      recentEvents: data.recentEvents.map((event) => ({
        ...event,
        timestamp: new Date(event.timestamp),
        details: this.truncateDetails(event.details),
      })),
    };
  }

  private truncateDetails(details: string): string {
    return details.length > 100 ? `${details.substring(0, 97)}...` : details;
  }
}
