// src/repositories/impl/dashboard.repo.ts
import type { Knex } from "knex";
import { DateTime } from "luxon";

// import { SecurityDashboardData } from "@/app/lib/types/security.types";
import type {
  ConversionMetrics,
  DashboardDataAggregate,
} from "@/app/lib/types/dashboardAggregate.types";
// import { OrderStatus } from "@/app/lib/types/orders.db.types";
import {
  UserStatus,
  type IDeviceDetailsDB,
  type IDeviceFingerprintDB,
  type ILoginHistoryDB,
  type ILoginHistoryWithDeviceDB,
  type IRateLimitsDB,
  type ISecurityDB,
  type IUserDB,
} from "@/app/lib/types/users.db.types";

import { connectDB } from "../db/db";

import type { BaseDashboardRepository } from "./BaseDashboardRepository";

interface AggregationResultItem<T = unknown> {
  [key: string]: T;
}
interface CountResult {
  count: string;
}

export class DashboardRepository implements BaseDashboardRepository {
  private knex: Knex;
  constructor() {
    this.knex = connectDB();
  }
  // User Analytics
  async getUserAnalytics() {
    // const _now = DateTime.now().toJSDate();
    const last24h = DateTime.now().minus({ days: 1 }).toJSDate();
    const last7d = DateTime.now().minus({ days: 7 }).toJSDate();
    const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();
    const last8WeekDate = DateTime.now().minus({ weeks: 8 }).toJSDate();

    // Helper function to parse count results
    const parseCount = (res: Array<{ count: string }>) =>
      res[0] ? Number(res[0].count) : 0;
    const [
      totalUsers,
      activeUsers,
      recentSignups,
      securitySummary,
      threatAnalysis,
      rateLimits,
      authActivity,
      activityTrends,
      trafficSources,
      deviceUsage,
      weeklyGrowth,
      demographics,
      botAttempts,
    ] = await Promise.all([
      // Total Users
      this.knex<IUserDB>("users").count<CountResult[]>("* as count"),

      // Active Users
      this.knex<IUserDB>("users")
        .where("status", UserStatus.ACTIVE)
        .count<CountResult[]>("* as count"),

      // Recent Signups
      this.knex<IUserDB>("users")
        .where("created_at", ">=", lastWeekDate)
        .count<CountResult[]>("* as count"),

      // Security Summary (Combined query)
      this.knex.raw<{
        rows: DashboardDataAggregate["userAnalytics"]["SecuritySummary"][];
      }>(`
          SELECT 
            COUNT(CASE WHEN rl.lock_until > NOW() THEN 1 END) as "lockedAccounts",
            COUNT(CASE WHEN u.two_factor_enabled THEN 1 END) as "twoFactorAdoption",
            COUNT(CASE WHEN s.impossible_travel OR s.suspicious_device_change THEN 1 END) as "highRiskUsers"
          FROM users u
          LEFT JOIN rate_limits rl ON u._id = rl.user_id AND rl.action = 'login'
          LEFT JOIN security s ON u._id = s.user_id
        `),

      // Threat Analysis
      this.knex<ISecurityDB>("security").select<
        DashboardDataAggregate["userAnalytics"]["ThreatAnalysis"][]
      >(
        this.knex.raw(
          `COUNT(CASE WHEN impossible_travel THEN 1 END) as "impossible_travel"`
        ),
        this.knex.raw(
          `COUNT(CASE WHEN suspicious_device_change THEN 1 END) as "suspiciousDevices"`
        )
      ),

      // Rate Limits
      this.knex<IRateLimitsDB>("rate_limits").select<
        DashboardDataAggregate["userAnalytics"]["RateLimitsResult"][]
      >(
        this.knex.raw(
          `COUNT(CASE WHEN action = 'login' AND lock_until > NOW() THEN 1 END) as "loginLockouts"`
        ),
        this.knex.raw(
          `COALESCE(SUM(CASE WHEN action = 'passwordReset' THEN attempts END), 0) as "passwordResets"`
        )
      ),

      // Auth Activity (Last 24h) with device relationship
      this.knex<ILoginHistoryWithDeviceDB>("login_history")
        .select<
          {
            logins: number;
            failures: number;
            uniqueLocations: number;
          }[]
        >(
          this.knex.raw(`COUNT(CASE WHEN success THEN 1 END)::int AS "logins"`),
          this.knex.raw(
            `COUNT(CASE WHEN NOT success THEN 1 END)::int AS "failures"`
          ),
          this.knex.raw(`
              COUNT(DISTINCT CONCAT(
                device_fingerprints.location_city, 
                '|', 
                device_fingerprints.location_country
              ))::int as "uniqueLocations"
            `)
        )
        .leftJoin(
          "device_fingerprints",
          "login_history.device_id",
          "device_fingerprints._id"
        )
        .where("login_history.created_at", ">=", last24h),

      // Activity Trends (Last 7 Days)
      this.knex<ILoginHistoryDB>("login_history")
        .select<
          DashboardDataAggregate["userAnalytics"]["ActivityTrend"][]
        >(this.knex.raw(`to_char(created_at, 'YYYY-MM-DD') AS "date"`), this.knex.raw(`COUNT(*) AS "attempts"`), this.knex.raw(`COUNT(*) FILTER (WHERE NOT success) AS "failures"`))
        .where("created_at", ">=", last7d)
        .groupByRaw(`to_char(created_at, 'YYYY-MM-DD')`)
        .orderBy("date"),

      // Traffic Sources (Last 7 Days) with device relationships
      this.knex<ILoginHistoryWithDeviceDB>("login_history")
        .select<DashboardDataAggregate["userAnalytics"]["TrafficSource"][]>(
          "device_fingerprints.location_city as city",
          "device_fingerprints.location_country as country",
          this.knex.raw(`COUNT(*)::int as logins`),
          this.knex.raw(
            `COUNT(DISTINCT login_history.user_id)::int as "uniqueUsers"`
          ),
          this.knex.raw(
            `ARRAY_AGG(DISTINCT device_details.device) as "commonDevices"`
          ),
          this.knex.raw(
            `ARRAY_AGG(DISTINCT device_details.browser) as "commonBrowsers"`
          ),
          this.knex.raw(`JSON_BUILD_OBJECT(
              'lat', MIN(device_fingerprints.location_latitude),
              'lng', MIN(device_fingerprints.location_longitude)
            ) as coordinates`)
        )
        .leftJoin(
          "device_fingerprints",
          "login_history.device_id",
          "device_fingerprints._id"
        )
        .leftJoin(
          "device_details",
          "device_fingerprints.fingerprint",
          "device_details.fingerprint"
        )
        .where("login_history.created_at", ">=", last7d)
        .andWhere("login_history.success", true)
        .groupBy(
          "device_fingerprints.location_city",
          "device_fingerprints.location_country"
        )
        .orderBy("logins", "desc")
        .limit(20),

      // Device Usage with proper typing
      this.knex<IDeviceDetailsDB>("device_details")
        .select<
          DashboardDataAggregate["userAnalytics"]["DeviceUsage"][]
        >("device", "os", this.knex.raw(`COUNT(*) as count`), this.knex.raw(`COUNT(DISTINCT device_fingerprints.location_city) as "citiesCoverage"`))
        .leftJoin(
          "device_fingerprints",
          "device_details.fingerprint",
          "device_fingerprints.fingerprint"
        )
        .groupBy("device", "os")
        .orderBy("count", "desc"),

      // Weekly Growth with window functions
      // Corrected weekly growth query
      this.knex
        .with("weekly_logins", (qb) => {
          qb
            .from("login_history")
            .where("created_at", ">=", last8WeekDate)
            .select([
              this.knex.raw(
                `TO_CHAR(created_at AT TIME ZONE 'UTC', 'IW')::int as week`
              ),
              this.knex.raw(
                `TO_CHAR(created_at AT TIME ZONE 'UTC', 'IYYY')::int as year`
              ),
              this.knex.raw("COUNT(*)::int as logins"),
            ]).groupByRaw(`
            TO_CHAR(created_at AT TIME ZONE 'UTC', 'IYYY'),
            TO_CHAR(created_at AT TIME ZONE 'UTC', 'IW')
          `);
        })
        .select(
          this.knex.raw(
            //   week_data.week,
            // week_data.year,
            `
        week_data.logins AS "currentLogins",
        COALESCE(LAG(week_data.logins) OVER (ORDER BY week_data.year, week_data.week), 0) AS "previousLogins",
        CASE 
          WHEN COALESCE(LAG(week_data.logins) OVER (ORDER BY week_data.year, week_data.week), 0) = 0 THEN 0
          ELSE ROUND(
            ((week_data.logins - LAG(week_data.logins) OVER (ORDER BY week_data.year, week_data.week))::numeric
            / NULLIF(LAG(week_data.logins) OVER (ORDER BY week_data.year, week_data.week), 0)) * 100, 2
          )
        END AS "growthPercentage",
        CONCAT('Week ', week_data.week::text, ' ', week_data.year::text) AS "label"
      `
          )
        )
        .from("weekly_logins as week_data"),

      // Demographics with normal column
      this.knex<IUserDB>("users")
        .select<
          DashboardDataAggregate["userAnalytics"]["DemographicResult"][]
        >("preferences_language as language", this.knex.raw("COUNT(*) as count"))
        .groupBy("preferences_language"),

      // Bot Attempts with proper typing
      this.knex<ILoginHistoryDB>("login_history")
        .where("is_bot", true)
        .join(
          "device_fingerprints",
          "login_history.device_id",
          "device_fingerprints._id"
        )
        .count<CountResult[]>("* as count"),
    ]);

    // Type-safe result processing
    return {
      totalUsers:
        parseCount(
          totalUsers
        ) /**Argument of type 'string[]' is not assignable to parameter of type '{ count: string; }[]'.
      Type 'string' is not assignable to type '{ count: string; }' */,
      activeUsers: parseCount(activeUsers),
      recentSignups: parseCount(recentSignups),
      languageDistribution: demographics.reduce(
        (acc, row) => ({
          ...acc,
          [row.language]: Number(row.count),
        }),
        {}
      ),
      geographicalInsights: {
        topLocations: await Promise.all(
          trafficSources.map(async (ts) => ({
            ...ts,
            coordinates: ts.coordinates,
            growthPercentage: await this.calculateCityGrowth(
              ts.city,
              ts.country
            ), // Implement calculateCityGrowth as needed
          }))
        ),
        deviceDistribution: deviceUsage.map((du) => ({
          device: du.device,
          os: du.os,
          count: Number(du.count),
          citiesCoverage: Number(du.citiesCoverage),
        })),
        totalCities: new Set(
          trafficSources.map((ts) => `${ts.city}, ${ts.country}`)
        ).size,
      },
      security: {
        twoFactorAdoption: Number(
          securitySummary.rows[0]?.twoFactorAdoption || 0
        ),
        lockedAccounts: Number(securitySummary.rows[0]?.lockedAccounts || 0),
        highRiskUsers: Number(securitySummary.rows[0]?.highRiskUsers || 0),
        authActivity: {
          loginsLast24h: Number(authActivity[0]?.logins || 0),
          failedAttempts: Number(authActivity[0]?.failures || 0),
          uniqueLocations: Number(authActivity[0]?.uniqueLocations || 0),
        },
        threats: {
          impossible_travel: Number(threatAnalysis[0]?.impossible_travel || 0),
          suspiciousDevices: Number(threatAnalysis[0]?.suspiciousDevices || 0),
          botAttempts: parseCount(botAttempts),
        },
        rateLimits: {
          activeLockouts: Number(rateLimits[0]?.loginLockouts || 0),
          passwordResetAttempts: Number(rateLimits[0]?.passwordResets || 0),
        },
        trends: activityTrends.map((t) => ({
          date: t.date,
          attempts: Number(t.attempts),
          successRate:
            Number(t.attempts) > 0
              ? `${Math.round((1 - Number(t.failures) / Number(t.attempts)) * 100)}%`
              : "0%",
        })),
      },
      deviceDiversity: {
        totalDevices: new Set(deviceUsage.map((du) => du.device)).size,
      },
      weeklyGrowth: weeklyGrowth,
      // .map((wg) => ({
      //   label: wg.label,
      //   currentLogins: Number(wg.currentLogins),
      //   previousLogins: Number(wg.previousLogins) || 0,
      //   growthPercentage: `${wg.growthPercentage.toFixed(1)}%`,
      // })),
    };
  }

  // Product Analytics
  async getProductAnalytics() {
    const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();
    const last8WeeksDate = DateTime.now().minus({ weeks: 8 }).toJSDate();
    // const last30d = DateTime.now().minus({ days: 30 }).toJSDate();
    const [
      stockInfo,
      salesMetrics,
      discountAnalysis,
      engagementMetrics,
      categoryDistribution,
      recentActivity,
      shippingMetrics,
      riskAnalysis,
      weeklyGrowth,
      reservationInsights,
    ] = await Promise.all([
      this.knex.raw<{
        rows: DashboardDataAggregate["productAnalytics"]["stockInfo"][];
      }>(`
        SELECT
          COUNT(*)::integer AS "total",
          SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END)::integer AS "outOfStock",
          SUM(CASE WHEN stock <= 10 THEN 1 ELSE 0 END)::integer AS "lowStock",
          SUM(CASE WHEN active THEN 1 ELSE 0 END)::integer AS "active",
          ROUND(COALESCE(SUM(price * stock), 0)::numeric, 2)::float8 AS "totalInventoryValue",
          ROUND(COALESCE(SUM(price * reserved), 0)::numeric, 2)::float8 AS "totalReservedValue"
        FROM products
      `),
      this.knex.raw<{
        rows: DashboardDataAggregate["productAnalytics"]["salesMetrics"][];
      }>(`
        SELECT
          COALESCE(SUM(sold), 0)::integer AS "totalSold",
          ROUND(COALESCE(SUM(price * sold), 0)::numeric, 2)::float8 AS "totalRevenue",
          ROUND(COALESCE(AVG(sold), 0)::numeric, 2)::float8 AS "avgSalesPerProduct",
          COALESCE(MAX(sold), 0)::integer AS "topSelling"
        FROM products
      `),
      this.knex.raw<{
        rows: DashboardDataAggregate["productAnalytics"]["discountAnalysis"][];
      }>(`
        SELECT
        count(*) as "activeDiscounts",
        SUM(case when discount_expire < NOW() - INTERVAL '7 days' then 1 else 0 end) as "expiringSoon",
        ROUND(COALESCE(AVG(discount), 0)::numeric, 2)::float8  as "avgDiscount"
        FROM products
        WHERE discount > 0 AND discount_expire IS NOT NULL
        AND discount_expire > NOW()
        `),
      this.knex.raw<{
        rows: DashboardDataAggregate["productAnalytics"]["engagementMetrics"][];
      }>(`
        SELECT
         ROUND(COALESCE(AVG(ratings_average), 0)::numeric, 2)::float8 "avgRating",
          SUM(ratings_quantity) as "totalReviews",
          SUM(CASE WHEN updated_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as "recentlyReviewed"
        FROM products
        `),
      this.knex.raw<{
        rows: DashboardDataAggregate["productAnalytics"]["categoryDistribution"][];
      }>(`
        SELECT
          category,
          COUNT(*) as "count",
          SUM(sold) as "totalSales",
          ROUND(COALESCE(AVG(price), 0)::numeric, 2)::float8 "avgPrice",
          AVG(stock) as "avgStock"
        FROM products
        GROUP BY category
      `),
      this.knex.raw<{
        rows: DashboardDataAggregate["productAnalytics"]["recentActivity"][];
      }>(
        `
        SELECT
          slug,
          name,
          case when created_at >= ? then 'New Product' else 'Updated Product' end as "type",
          last_modified_by
        FROM products
        WHERE created_at >= ?
           OR updated_at >= ?
      `,
        [lastWeekDate, lastWeekDate, lastWeekDate]
      ),
      this.knex.raw<{
        rows: DashboardDataAggregate["productAnalytics"]["shippingMetrics"][];
      }>(`
        SELECT
          ROUND(COALESCE(AVG(weight), 0)::numeric, 2)::float8 AS "avgWeight",
          SUM(length * width * height) as "totalVolume"
        FROM products p
        left join product_shopping_info pi on p._id = pi.product_id
          where pi.product_id is not null
    
        `),
      this.knex.raw<{
        rows: DashboardDataAggregate["productAnalytics"]["riskAnalysis"][];
      }>(`
      SELECT 
       COALESCE( COUNT(*),0)  AS "highRiskProducts"
      FROM products
      WHERE stock < reserved
        OR reserved > stock * 0.5;

        `),
      this.knex
        .with("weekly_sales", (qb) => {
          qb.from("products")
            .where("created_at", ">=", last8WeeksDate)
            .select([
              this.knex.raw(
                `TO_CHAR(created_at AT TIME ZONE 'UTC', 'IW')::int as week`
              ),
              this.knex.raw(
                `TO_CHAR(created_at AT TIME ZONE 'UTC', 'IYYY')::int as year`
              ),
              this.knex.raw(`SUM(sold)::integer as sales`),
              this.knex.raw(`SUM(price * sold)::float8 as revenue`),
            ])
            .groupByRaw("year, week")
            .orderByRaw("year, week");
        })
        .select(
          "year",
          "week",
          "sales as currentSales",
          this.knex.raw(
            `LAG(sales) OVER (ORDER BY year, week) AS "previousSales"`
          ),
          "revenue as currentRevenue",
          this.knex.raw(
            `LAG(revenue) OVER (ORDER BY year, week) AS "previousRevenue"`
          ),
          this.knex.raw(`
            CASE
              WHEN LAG(sales) OVER (ORDER BY year, week) = 0 THEN 0
              ELSE ROUND(
                ((sales - LAG(sales) OVER (ORDER BY year, week)) * 100.0 / 
                LAG(sales) OVER (ORDER BY year, week)),
                2
              )
            END AS "salesGrowth"
          `),
          this.knex.raw(`
            CASE
              WHEN LAG(revenue) OVER (ORDER BY year, week) = 0 THEN 0
              ELSE ROUND(
                ((revenue - LAG(revenue) OVER (ORDER BY year, week)) * 100.0 / 
                LAG(revenue) OVER (ORDER BY year, week))::numeric,
                2
              )
            END AS "revenueGrowth"
          `),
          this.knex.raw(`CONCAT('Week ', week::text, ' ', year::text) as label`)
        )
        .from("weekly_sales"),
      // New: Reservation Insights
      this.knex.raw<{
        rows: Array<{
          totalReserved: number;
          totalReservedValue: number;
          conversionRate: number;
          avgReservationDuration: number;
          abandonmentRate: number;
        }>;
      }>(`
      WITH reservation_stats AS (
        SELECT
          SUM(r.quantity) AS total_reserved,
          SUM(r.quantity * p.price) AS total_reserved_value,
          COUNT(*) FILTER (WHERE r.status = 'confirmed') AS confirmed_count,
          COUNT(*) FILTER (WHERE r.status = 'cancelled') AS cancelled_count, 
          COUNT(*) FILTER (WHERE r.status = 'pending' AND r.expires_at < NOW()) AS expired_count,
          AVG(EXTRACT(EPOCH FROM (r.expires_at - r.created_at))/3600)::float AS avg_reservation_hours
        FROM reservations r
        JOIN products p ON r.product_id = p._id
        WHERE r.created_at >= NOW() - INTERVAL '30 days'
      )
      SELECT
        COALESCE(total_reserved, 0)::integer AS "totalReserved",
        COALESCE(total_reserved_value, 0)::float8 AS "totalReservedValue",
        COALESCE(avg_reservation_hours, 0)::float8 AS "avgReservationDuration",
        CASE 
          WHEN total_reserved > 0 
          THEN (confirmed_count::float / total_reserved) * 100 
          ELSE 0 
        END::float8 AS "conversionRate",
        CASE 
          WHEN total_reserved > 0 
          THEN ((cancelled_count + expired_count)::float / total_reserved) * 100 
          ELSE 0 
        END::float8 AS "abandonmentRate"
      FROM reservation_stats
    `),
    ]);
    // Process results with proper nesting and field names
    return {
      inventory: {
        total: Number(stockInfo.rows[0]?.total || 0),
        outOfStock: Number(stockInfo.rows[0]?.outOfStock || 0),
        lowStock: Number(stockInfo.rows[0]?.lowStock || 0),
        active: Number(stockInfo.rows[0]?.active || 0),
        totalValue: Number(stockInfo.rows[0]?.totalInventoryValue || 0),
        reservedValue: Number(stockInfo.rows[0]?.totalReservedValue || 0),
      },
      sales: {
        totalSold: Number(salesMetrics.rows[0]?.totalSold || 0),
        totalRevenue: Number(salesMetrics.rows[0]?.totalRevenue || 0),
        avgSales: Number(salesMetrics.rows[0]?.avgSalesPerProduct || 0),
        topSelling: Number(salesMetrics.rows[0]?.topSelling || 0),
      },
      discounts: {
        active: Number(discountAnalysis.rows[0]?.activeDiscounts || 0),
        expiringSoon: Number(discountAnalysis.rows[0]?.expiringSoon || 0),
        avgDiscount: Number(discountAnalysis.rows[0]?.avgDiscount || 0),
      },
      engagement: {
        avgRating: Number(engagementMetrics.rows[0]?.avgRating || 0),
        totalReviews: Number(engagementMetrics.rows[0]?.totalReviews || 0),
        recentReviews: Number(engagementMetrics.rows[0]?.recentlyReviewed || 0),
      },
      categories: categoryDistribution.rows.map((row) => ({
        name: row.category,
        count: Number(row.count),
        sales: Number(row.totalSales),
        avgPrice: Number(row.avgPrice),
        avgStock: Number(row.avgStock),
      })),
      recentChanges: recentActivity.rows.map((row) => ({
        slug: row.slug, // Adjust based on your actual ID field
        name: row.name,
        type: row.type,
        modifiedBy: row.last_modified_by,
      })),
      shipping: {
        avgWeight: Number(shippingMetrics.rows[0]?.avgWeight || 0),
        totalVolume: Number(shippingMetrics.rows[0]?.totalVolume || 0),
      },
      risk: {
        stockConflicts: Number(riskAnalysis.rows[0]?.highRiskProducts || 0),
      },
      weeklyGrowth: weeklyGrowth.map(
        (row: DashboardDataAggregate["productAnalytics"]["weeklyGrowth"]) => ({
          label: row.label,
          salesGrowth: Number(row.salesGrowth || 0),
          currentSales: Number(row.currentSales || 0),
          previousSales: Number(row.previousSales || 0),
          currentRevenue: Number(row.currentRevenue || 0),
          revenueGrowth: Number(row.revenueGrowth || 0),
          previousRevenue: Number(row.previousRevenue || 0),
        })
      ), // New: Reservation analytics
      reservations: {
        reservedQuantity: Number(
          reservationInsights.rows[0]?.totalReserved || 0
        ),
        conversionRate: Number(
          reservationInsights.rows[0]?.conversionRate || 0
        ),
        abandonmentRate: Number(
          reservationInsights.rows[0]?.abandonmentRate || 0
        ),
        reservedValue: Number(
          reservationInsights.rows[0]?.totalReservedValue || 0
        ),
        avgReservationDuration: Number(
          reservationInsights.rows[0]?.avgReservationDuration || 0
        ),
      },
    };
  }

  // Order Analytics
  async getOrderAnalytics() {
    const now = DateTime.now();
    const periods = {
      yearlyStart: now.minus({ years: 1 }).toJSDate(),
      weeklyStart: now.minus({ weeks: 8 }).toJSDate(),
    };

    const [
      summary,
      financials,
      customerInsights,
      productAnalytics,
      timeSeries,
      geographicInsights,
      paymentMethods,
      fulfillment,
      recentOrders,
      weeklyGrowth,
      weeklyComparison,
    ] = await Promise.all([
      // Summary
      this.knex.raw<{
        rows: DashboardDataAggregate["orderAnalytics"]["summary"][];
      }>(`
        SELECT
          COUNT(*)::int AS "totalOrders",
          COUNT(*) FILTER (WHERE status = 'completed')::int AS "completedOrders",
          ROUND(AVG(total)::numeric, 2)::float AS "avgOrderValue",
          ROUND(SUM(total)::numeric, 2)::float AS "totalRevenue",
          ROUND(AVG(item_counts.count)::numeric, 2)::float AS "avgItemsPerOrder"
        FROM orders
        LEFT JOIN (
          SELECT order_id, COUNT(*) AS "count"
          FROM order_items
          GROUP BY order_id
        ) item_counts ON orders._id = item_counts.order_id
      `),

      // Financials
      this.knex.raw<{
        rows: DashboardDataAggregate["orderAnalytics"]["financials"][];
      }>(`
        SELECT
          ROUND(SUM(total) FILTER (WHERE status = 'completed')::numeric, 2)::float AS "netRevenue",
          ROUND(SUM(tax)::numeric, 2)::float AS "totalTax",
          ROUND(SUM(total) FILTER (WHERE status = 'cancelled')::numeric, 2)::float AS "refunds"
          FROM orders
          `),
      // ROUND(AVG(shipping_cost + (total * 0.03))::numeric, 2)::float AS "avgProcessingCost"

      // Customer Insights
      this.knex.raw<{
        rows: DashboardDataAggregate["orderAnalytics"]["customerInsights"][];
      }>(`
        WITH customer_stats AS (
          SELECT
            user_id,
            COUNT(*)::int AS "orders",
            SUM(total)::float AS "spent"
          FROM orders
          GROUP BY user_id
        )
        SELECT
          COUNT(*) FILTER (WHERE orders > 1)::int AS "repeatCustomers",
          ROUND(AVG(spent)::numeric, 2)::float AS "avgLifetimeValue",
          ROUND(MAX(spent)::numeric, 2)::float AS "topSpender"
        FROM customer_stats
      `),

      // Product Analytics
      this.knex.raw<{
        rows: DashboardDataAggregate["orderAnalytics"]["productAnalytics"][];
      }>(`
        SELECT
          product_id AS "_id",
          MAX(name) AS "productName",
          SUM(quantity)::int AS "totalSold",
          ROUND(SUM(quantity * final_price)::numeric, 2)::float AS "totalRevenue"
        FROM order_items
        GROUP BY product_id
        ORDER BY "totalRevenue" DESC
        LIMIT 15
      `),

      // Time Series
      this.knex.raw<{
        rows: DashboardDataAggregate["orderAnalytics"]["timeSeries"][];
      }>(
        `
            SELECT
        EXTRACT(YEAR FROM created_at)::int AS "year",
        EXTRACT(MONTH FROM created_at)::int AS "month",
        COUNT(*)::int AS "count",
        ROUND(SUM(total)::numeric, 2)::float AS "revenue",
        ROUND(AVG(total)::numeric, 2)::float AS "avgOrderValue"
      FROM orders
      WHERE created_at >= ?
      GROUP BY year, month
      ORDER BY year, month
    `,
        [periods.yearlyStart]
      ),
      // Geographic Insights
      this.knex.raw<{
        rows: DashboardDataAggregate["orderAnalytics"]["geographicInsights"][];
      }>(`
        SELECT
        osa.city,
        osa.state,
        osa.country,
        COUNT(*)::int AS "orderCount",
        ROUND(SUM(o.total)::numeric, 2)::float AS "totalRevenue"
      FROM order_shipping_address osa
      JOIN orders o ON osa.order_id = o._id
      GROUP BY osa.city, osa.state, osa.country
      ORDER BY "totalRevenue" DESC
      LIMIT 15
    `),

      // Payment Methods
      this.knex.raw<{
        rows: DashboardDataAggregate["orderAnalytics"]["paymentMethods"][];
      }>(`
        SELECT
          (payment->>'method')::text AS "method",
          COUNT(*)::int,
          ROUND(SUM(total)::numeric, 2)::float AS "totalAmount",
          ROUND(AVG(total)::numeric, 2)::float AS "avgAmount"
        FROM orders
        GROUP BY method
      `),

      // Fulfillment
      this.knex.raw<{
        rows: DashboardDataAggregate["orderAnalytics"]["fulfillment"][];
      }>(`
        SELECT
          status AS "_id",
          COUNT(*)::int,
          ROUND(
            AVG(EXTRACT(EPOCH FROM updated_at - created_at)) / 3600::numeric, 
            2
          )::float AS "avgFulfillmentTime"
        FROM orders
        GROUP BY status
      `),

      // Recent Orders
      this.knex.raw<{
        rows: DashboardDataAggregate["orderAnalytics"]["recentOrders"][];
      }>(`
        SELECT
          orders._id,
          orders.status,
          orders.total,
          TO_CHAR(orders.created_at, 'YYYY-MM-DD HH24:MI:SS') AS "created_at",
          JSON_AGG(JSON_BUILD_OBJECT(
            'name', order_items.name,
            'quantity', order_items.quantity,
            'price', order_items.price
          )) AS "items"
        FROM orders
        JOIN order_items ON orders._id = order_items.order_id
        GROUP BY orders._id
        ORDER BY orders.created_at DESC
        LIMIT 10
      `),

      // Weekly Growth
      this.knex.raw<{
        rows: DashboardDataAggregate["orderAnalytics"]["weeklyGrowth"][];
      }>(
        `
       WITH weekly_data AS (
        SELECT
          EXTRACT(ISOYEAR FROM created_at)::int AS "year",
          EXTRACT(WEEK FROM created_at)::int AS "week",
          COUNT(*)::int AS "current_orders",
          SUM(total)::float AS "current_revenue"
        FROM orders
        WHERE created_at >= ?
        GROUP BY year, week
      )
      SELECT
        year,
        week,
        current_orders,
        LAG(current_orders) OVER w AS "previous_orders",
        ROUND(current_revenue::numeric, 2) AS "current_revenue",
        LAG(current_revenue) OVER w AS "previous_revenue",
        CONCAT('Week ', week, ' ', year) AS "label"
      FROM weekly_data
      WINDOW w AS (ORDER BY year, week)
      ORDER BY year, week
    `,
        [periods.weeklyStart]
      ),
      // Weekly Comparison
      this.knex.raw<{
        rows: DashboardDataAggregate["orderAnalytics"]["weeklyComparison"][];
      }>(`    WITH dates AS (
        SELECT 
          date_trunc('week', CURRENT_DATE) - INTERVAL '1 week' AS "current_week_start",
          date_trunc('week', CURRENT_DATE) - INTERVAL '2 weeks' AS "previous_week_start"
      )
      SELECT
        'current_vs_previous' AS "week",
        SUM(CASE WHEN o.created_at >= d.current_week_start THEN o.total ELSE 0 END) AS "currentWeek",
        SUM(CASE WHEN o.created_at >= d.previous_week_start AND o.created_at < d.current_week_start THEN o.total ELSE 0 END) AS "previousWeek"
      FROM orders o, dates d
      WHERE o.created_at >= d.previous_week_start
      AND o.status = 'completed'
      GROUP BY week
    `),
    ]);

    // Calculate derived metrics
    const netRevenue = Number(financials.rows[0]?.netRevenue || 0);
    const totalRevenue = Number(summary.rows[0]?.totalRevenue || 0);
    const refunds = Number(financials.rows[0]?.refunds || 0);
    // const processingCosts = Number(financials.rows[0]?.avgProcessingCost || 0);
    const repeatCustomers = Number(
      customerInsights.rows[0]?.repeatCustomers || 0
    );
    const totalOrders = Number(summary.rows[0]?.totalOrders || 0);
    const weeklyComparisonData = weeklyComparison.rows[0] || {
      currentWeek: 0,
      previousWeek: 0,
    };
    return {
      summary: {
        totalOrders,
        completedOrders: Number(summary.rows[0]?.completedOrders || 0),
        avgOrderValue: Number(summary.rows[0]?.avgOrderValue || 0),
        totalRevenue,
        avgItemsPerOrder: Number(summary.rows[0]?.avgItemsPerOrder || 0),
      },
      financialHealth: {
        netRevenue,
        totalTax: Number(financials.rows[0]?.totalTax || 0),
        // processingCosts,
        // netProfitMargin: {
        //   monthly:
        //     netRevenue > 0
        //       ? Number(
        //           (((netRevenue - processingCosts) / netRevenue) * 100).toFixed(
        //             2
        //           )
        //         )
        //       : 0,
        // },
        refundRate:
          totalRevenue > 0
            ? Number(((refunds / totalRevenue) * 100).toFixed(2))
            : 0,
        weeklyGrowth:
          weeklyComparisonData.previousWeek > 0
            ? Number(
                (
                  ((weeklyComparisonData.currentWeek -
                    weeklyComparisonData.previousWeek) /
                    weeklyComparisonData.previousWeek) *
                  100
                ).toFixed(2)
              )
            : 0,
      },
      customerBehavior: {
        repeatRate:
          totalOrders > 0
            ? Number(((repeatCustomers / totalOrders) * 100).toFixed(2))
            : 0,
        avgLTV: Number(customerInsights.rows[0]?.avgLifetimeValue || 0),
        topSpender: Number(customerInsights.rows[0]?.topSpender || 0),
      },
      topProducts: productAnalytics.rows.map((p) => ({
        product_id: p._id,
        name: p.productName,
        unitsSold: Number(p.totalSold),
        revenue: Number(p.totalRevenue),
      })),
      trends: {
        monthly: timeSeries.rows.map((t) => ({
          period: `${t.year}-${String(t.month).padStart(2, "0")}`,
          orders: Number(t.count),
          revenue: Number(t.revenue),
          aov: Number(t.avgOrderValue),
        })),
        yoyGrowth: this.calculateYoYGrowth(timeSeries.rows),
        weeklyBreakdown: weeklyComparison.rows.map((w) => ({
          week: w.week,
          current: w.currentWeek,
          previous: w.previousWeek,
          growth:
            weeklyComparisonData.previousWeek > 0
              ? Number(
                  (
                    ((w.currentWeek - w.previousWeek) / w.previousWeek) *
                    100
                  ).toFixed(2)
                )
              : 0,
        })),
      },
      fulfillment: {
        statusDistribution: fulfillment.rows.reduce(
          (acc, curr) => ({
            ...acc,
            [curr._id]: {
              count: Number(curr.count),
              avgHours: Number(curr.avgFulfillmentTime),
            },
          }),
          {} as Record<string, { count: number; avgHours: number }>
        ),
        slaCompliance: this.calculateSLACompliance(fulfillment.rows),
      },
      paymentMethods: paymentMethods.rows.map((p) => ({
        method: p.method,
        usageCount: Number(p.count),
        totalProcessed: Number(p.totalAmount),
      })),
      topLocations: geographicInsights.rows.map((g) => ({
        city: g.city,
        state: g.state,
        country: g.country,
        orderCount: Number(g.orderCount),
        revenue: Number(g.totalRevenue),
      })),
      recentOrders: recentOrders.rows.map((o) => ({
        ...o,
        _id: o._id.toString(),
        created_at: new Date(o.created_at),
        items: o.items,
      })),
      weeklyGrowth: weeklyGrowth.rows.map((w) => ({
        label: w.label,
        orderGrowth: Number(w.previous_orders)
          ? Number(
              (
                ((w.current_orders - w.previous_orders) / w.previous_orders) *
                100
              ).toFixed(2)
            )
          : 0,
        revenueGrowth: Number(w.previous_revenue)
          ? Number(
              (
                ((w.current_revenue - w.previous_revenue) /
                  w.previous_revenue) *
                100
              ).toFixed(2)
            )
          : 0,
        currentOrders: Number(w.current_orders),
        currentRevenue: Number(w.current_revenue),
      })),
    };
  }

  // Helper methods
  private calculateYoYGrowth(
    timeSeries: DashboardDataAggregate["orderAnalytics"]["timeSeries"][]
  ): number {
    if (timeSeries.length < 2) {
      return 0;
    }

    const currentYear = timeSeries[timeSeries.length - 1];
    const previousYear = timeSeries.find(
      (t) => t.year === currentYear.year - 1 && t.month === currentYear.month
    );

    if (!previousYear) {
      return 0;
    }

    return Number(
      (
        ((currentYear.revenue - previousYear.revenue) / previousYear.revenue) *
        100
      ).toFixed(2)
    );
  }

  private calculateSLACompliance(
    fulfillment: DashboardDataAggregate["orderAnalytics"]["fulfillment"][]
  ): number {
    const completed = fulfillment.find((f) => f._id === "completed");
    const total = fulfillment.reduce((sum, f) => sum + f.count, 0);

    return total > 0
      ? Number((((completed?.count || 0) / total) * 100).toFixed(2))
      : 0;
  }
  // Report Analytics
  async getReportAnalytics() {
    const last30Days = DateTime.now().minus({ days: 30 }).toJSDate();
    const last8Weeks = DateTime.now().minus({ weeks: 8 }).toJSDate();

    const [
      summary,
      statusDistribution,
      recentReports,
      commonIssues,
      dailyTrend,
      weeklyGrowth,
    ] = await Promise.all([
      // Summary
      this.knex.raw<{
        rows: DashboardDataAggregate["reportAnalytics"]["summary"][];
      }>(`
        SELECT
          COUNT(*)::int AS "total",
          COUNT(*) FILTER (WHERE status = 'resolved')::int AS "resolved",
          ROUND(AVG(
            EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
          )::numeric, 2)::float AS "avgResolutionHours"
        FROM reports
      `),

      // Status Distribution
      this.knex.raw<{
        rows: DashboardDataAggregate["reportAnalytics"]["statusDistribution"];
      }>(`
        SELECT 
          status AS "_id",
          COUNT(*)::int As "count"
        FROM reports
        GROUP BY status
      `),

      // Recent Reports
      this.knex.raw<{
        rows: DashboardDataAggregate["reportAnalytics"]["recentReports"];
      }>(`
        SELECT
          r._id,
          r.issue,
          r.status,
          p.slug AS "product",
          u.name AS "reporter",
          TO_CHAR(r.created_at, 'YYYY-MM-DD') AS "created_at"
         
        FROM reports r
        JOIN products p ON r.product_id = p._id
        JOIN users u ON r.reporter_id = u._id
        ORDER BY r.created_at DESC
        LIMIT 5
      `),

      // Common Issues (Trending Issues)
      this.knex.raw<{
        rows: DashboardDataAggregate["reportAnalytics"]["commonIssues"];
      }>(`
        SELECT
          issue AS "_id",
          COUNT(*)::int AS "count",
          ARRAY_AGG(DISTINCT p.slug) AS "products"
        FROM reports r
        JOIN products p ON r.product_id = p._id
        GROUP BY issue
        ORDER BY count DESC
        LIMIT 5
      `),

      // Daily Trend
      this.knex.raw<{ rows: Array<{ date: string; reports: number }> }>(
        `
        SELECT
          TO_CHAR(created_at, 'YYYY-MM-DD') AS date,
          COUNT(*)::int AS "reports"
        FROM reports
        WHERE created_at >= ?
        GROUP BY date
        ORDER BY date
      `,
        [last30Days]
      ),

      // Weekly Growth
      this.knex.raw<{
        rows: DashboardDataAggregate["reportAnalytics"]["weeklyGrowth"];
      }>(
        `
        WITH weekly_data AS (
          SELECT
            EXTRACT(ISOYEAR FROM created_at)::int AS "year",
            EXTRACT(WEEK FROM created_at)::int AS "week",
            COUNT(*) FILTER (WHERE status = 'resolved')::int AS "resolved_count",
            COUNT(*)::int AS "total_count"
          FROM reports
          WHERE created_at >= ?
          GROUP BY year, week
        )
        SELECT
          CONCAT('Week ', week, ' ', year) AS label,
          resolved_count AS "currentResolved",
          total_count AS "currentTotal",
          COALESCE(LAG(resolved_count) OVER w, 0)::float AS "previousResolved",
          COALESCE(LAG(total_count) OVER w, 0)::float AS "previousTotal"
        FROM weekly_data
        WINDOW w AS (ORDER BY year, week)
        ORDER BY year, week
      `,
        [last8Weeks]
      ),
    ]);

    // Helper function to safely get first result

    // Calculate resolution rate
    const totalReports = this.getFirstNumber(summary.rows, "total");
    const resolvedReports = this.getFirstNumber(summary.rows, "resolved");
    const resolutionRate =
      totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0;

    // Transform status distribution to object format
    const statusBreakdown: Record<string, number> = {};
    statusDistribution.rows.forEach((row) => {
      statusBreakdown[row._id] = row.count;
    });

    // Transform weekly growth to match interface
    const weeklyTrends = weeklyGrowth.rows.map((w) => {
      const resolutionGrowth =
        w.previousResolved > 0
          ? `${(((w.currentResolved - w.previousResolved) / w.previousResolved) * 100).toFixed(1)}%`
          : "0.0%";

      const reportGrowth =
        w.previousTotal > 0
          ? `${(((w.currentTotal - w.previousTotal) / w.previousTotal) * 100).toFixed(1)}%`
          : "0.0%";

      return {
        label: w.label,
        resolutionGrowth,
        reportGrowth,
        currentResolved: w.currentResolved,
        currentTotal: w.currentTotal,
      };
    });

    return {
      total: totalReports,
      resolved: resolvedReports,
      resolutionRate,
      avgResolutionTime: this.getFirstNumber(
        summary.rows,
        "avgResolutionHours"
      ),
      statusBreakdown,
      trendingIssues: commonIssues.rows.map((i) => ({
        issue: i._id,
        count: i.count,
        affectedProducts: i.products,
      })),
      recentReports: recentReports.rows.map((r) => ({
        ...r,
        _id: r._id.toString(),
        created_at: new Date(r.created_at),
      })),
      dailyTrend: dailyTrend.rows.map((d) => ({
        date: d.date,
        reports: d.reports,
      })),
      weeklyTrends,
    };
  }

  // Refund Analytics
  async getRefundAnalytics() {
    const lastMonthDate = DateTime.now().minus({ months: 1 }).toJSDate();
    const last8WeeksDate = DateTime.now().minus({ weeks: 8 }).toJSDate();

    const [
      summary,
      statusTrend,
      recentRefunds,
      commonReasons,
      highRiskRefunds,
      financialImpact,
      weeklyGrowthRaw,
    ] = await Promise.all([
      this.knex.raw<{
        rows: DashboardDataAggregate["refundAnalytics"]["summary"][];
      }>(`
        SELECT
          COUNT(*)::int AS "total",
          SUM(amount)::float AS "totalAmount",
          COUNT(*) FILTER (WHERE status = 'approved')::int AS "approved",
          ROUND(AVG(EXTRACT(EPOCH FROM updated_at - created_at) / 3600)::numeric, 2)::float AS "avgProcessingHours"
        FROM refunds
      `),
      this.knex.raw<{
        rows: DashboardDataAggregate["refundAnalytics"]["statusTrend"];
      }>(
        `
        SELECT
          status,
          COUNT(*)::int AS "count",
          EXTRACT(WEEK FROM created_at)::int AS "week"
        FROM refunds
        WHERE created_at >= ?
        GROUP BY status, week
        ORDER BY week
      `,
        [lastMonthDate]
      ),
      this.knex.raw<{
        rows: DashboardDataAggregate["refundAnalytics"]["recentRefunds"];
      }>(`
        SELECT
          refunds._id,
          refunds.amount,
          refunds.status,
          TO_CHAR(refunds.created_at, 'YYYY-MM-DD HH24:MI:SS') AS "created_at",
          users.name AS "user",
          refunds.invoice_id
        FROM refunds
        JOIN users ON refunds.user_id = users._id
        ORDER BY refunds.created_at DESC
        LIMIT 5
      `),
      this.knex.raw<{
        rows: DashboardDataAggregate["refundAnalytics"]["commonReasons"];
      }>(`
        SELECT
          reason,
          COUNT(*)::int AS "count",
          SUM(amount)::float AS "totalAmount"
        FROM refunds
        GROUP BY reason
        ORDER BY count DESC
        LIMIT 5
      `),
      this.knex.raw<{
        rows: DashboardDataAggregate["refundAnalytics"]["highRiskRefunds"];
      }>(`
        SELECT COUNT(*)::int AS "count"
        FROM refunds
        WHERE amount > 500 AND status = 'pending'
      `),
      this.knex.raw<{
        rows: DashboardDataAggregate["refundAnalytics"]["financialImpact"];
      }>(`
        SELECT
          ROUND(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END)::numeric, 2)::float AS "totalRefunded",
          ROUND(AVG(amount)::numeric, 2)::float AS "avgRefund",
          ROUND(MAX(amount)::numeric, 2)::float AS "maxRefund"
        FROM refunds
      `),
      this.knex.raw<{
        rows: DashboardDataAggregate["refundAnalytics"]["weeklyGrowth"];
      }>(
        `
        WITH weekly_data AS (
          SELECT
            EXTRACT(ISOYEAR FROM created_at)::int AS "year",
            EXTRACT(WEEK FROM created_at)::int AS "week",
            SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END)::float AS "current_amount",
            COUNT(*)::int AS "current_count"
          FROM refunds
          WHERE created_at >= ? AND status = 'approved'
          GROUP BY year, week
        )
        SELECT
          year,
          week,
          current_amount,
          current_count,
          LAG(current_amount) OVER (ORDER BY year, week) AS "previous_amount",
          LAG(current_count) OVER (ORDER BY year, week) AS "previous_count",
          CONCAT('Week ', week, ' ', year) AS "label"
        FROM weekly_data
        ORDER BY year, week
      `,
        [last8WeeksDate]
      ),
    ]);
    // Calculate approval rate
    const totalRefunds = this.getFirstNumber(summary.rows, "total");
    const approvedRefunds = this.getFirstNumber(summary.rows, "approved");
    const approvalRate =
      totalRefunds > 0 ? (approvedRefunds / totalRefunds) * 100 : 0;

    // Transform status trend to weekly format
    const weeklyTrend: Record<string, Record<string, number>> = {};
    statusTrend.rows.forEach((row) => {
      const weekKey = `Week ${row.week}`;
      if (!weeklyTrend[weekKey]) {
        weeklyTrend[weekKey] = {};
      }
      weeklyTrend[weekKey][row.status] = row.count;
    });

    // Transform weekly growth to match Mongoose format
    const weeklyGrowth = weeklyGrowthRaw.rows.map((w) => {
      const amountGrowth =
        w.previous_amount > 0
          ? ((w.current_amount - w.previous_amount) / w.previous_amount) * 100
          : 0;

      const countGrowth =
        w.previous_count > 0
          ? ((w.current_count - w.previous_count) / w.previous_count) * 100
          : 0;

      return {
        label: w.label,
        amountGrowth: `${amountGrowth.toFixed(1)}%`,
        countGrowth: `${countGrowth.toFixed(1)}%`,
        currentAmount: w.current_amount,
        currentCount: w.current_count,
      };
    });

    return {
      total: totalRefunds,
      totalAmount: this.getFirstNumber(summary.rows, "totalAmount"),
      approvalRate,
      avgProcessingTime: this.getFirstNumber(
        summary.rows,
        "avgProcessingHours"
      ),
      weeklyTrend,
      commonReasons: commonReasons.rows.map((r) => ({
        reason: r._id,
        frequency: r.count,
        financialImpact: r.totalAmount,
      })),
      recentRefunds: recentRefunds.rows.map((r) => ({
        ...r,
        _id: r._id.toString(),
        created_at: new Date(r.created_at),
      })),
      weeklyGrowth,
      highRiskRefunds: {
        count: this.getFirstNumber(highRiskRefunds.rows, "count"),
      },
      financialImpact: {
        totalRefunded: this.getFirstNumber(
          financialImpact.rows,
          "totalRefunded"
        ),
        avgRefund: this.getFirstNumber(financialImpact.rows, "avgRefund"),
        maxRefund: this.getFirstNumber(financialImpact.rows, "maxRefund"),
      },
    };
  }

  // User Interest Analytics
  async getUserInterestAnalytics() {
    const [
      cartInsights,
      wishlistInsights,
      combinedInsights,
      frequentlyCartAdded,
      frequentlyWishlisted,
      abandonedItems,
      frequentlyReserved,
    ] = await Promise.all([
      // Cart Insights
      this.knex.raw<{
        rows: Array<{
          category: string;
          totalItems: number;
          uniqueUsers: number;
          avgPrice: number;
          minPrice: number;
          maxPrice: number;
        }>;
      }>(`
               SELECT
                 p.category,
                 SUM(ci.quantity)::integer AS "totalItems",
                 COUNT(DISTINCT ci.user_id)::integer AS "uniqueUsers",
                 ROUND(AVG(p.price)::numeric, 2)::float8 AS "avgPrice",
                 MIN(p.price)::float8 AS "minPrice",
                 MAX(p.price)::float8 AS "maxPrice"
               FROM cart_items ci
               JOIN products p ON ci.product_id = p._id
               WHERE ci.created_at >= NOW() - INTERVAL '30 days'
               GROUP BY p.category
               ORDER BY "totalItems" DESC
               LIMIT 10
             `),

      // Wishlist Insights
      this.knex.raw<{
        rows: Array<{
          category: string;
          totalItems: number;
          uniqueUsers: number;
          avgPrice: number;
          priceSensitivity: number;
        }>;
      }>(`
               SELECT
                 p.category,
                 COUNT(*)::integer AS "totalItems",
                 COUNT(DISTINCT w.user_id)::integer AS "uniqueUsers",
                 ROUND(AVG(p.price)::numeric, 2)::float8 AS "avgPrice",
                 ROUND(AVG(CASE WHEN p.discount > 0 THEN 1 ELSE 0 END)::numeric, 2)::float8 AS "priceSensitivity"
               FROM wishlist w
               JOIN products p ON w.product_id = p._id
               WHERE w.created_at >= NOW() - INTERVAL '30 days'
               GROUP BY p.category
               ORDER BY "totalItems" DESC
               LIMIT 10
             `),

      // Combined Cart and Wishlist Insights
      this.knex.raw<{
        rows: Array<{
          slug: string;
          name: string;
          category: string;
          cartCount: number;
          wishlistCount: number;
          interestScore: number;
        }>;
      }>(`
               SELECT
                 p.slug,
                 p.name,
                 p.category,
                 COALESCE(SUM(ci.quantity)::integer, 0) AS "cartCount",
                 COALESCE(COUNT(w.product_id)::integer, 0) AS "wishlistCount",
                 (COALESCE(SUM(ci.quantity)::integer, 0) * 0.6 + COALESCE(COUNT(w.product_id)::integer, 0) * 0.4)::float8 AS "interestScore"
               FROM products p
               LEFT JOIN cart_items ci ON p._id = ci.product_id AND ci.created_at >= NOW() - INTERVAL '30 days'
               LEFT JOIN wishlist w ON p._id = w.product_id AND w.created_at >= NOW() - INTERVAL '30 days'
               GROUP BY p._id, p.name, p.category
               ORDER BY interestScore DESC
               LIMIT 10
             `),

      // Frequently Cart Added
      this.getTopProducts("cart_items", 10),
      this.getTopProducts("wishlist", 10),
      this.getAbandonedProducts(),
      // New: Frequently Reserved Products
      this.knex.raw<{
        rows: Array<{
          slug: string;
          name: string;
          category: string;
          price: number;
          count: number;
          avgReservationHours: number;
        }>;
      }>(`
        SELECT
          p.slug,
          p.name,
          p.category,
          p.price,
          COUNT(*)::integer AS "count",
          ROUND(AVG(EXTRACT(EPOCH FROM (r.expires_at - r.created_at))/3600)::numeric, 2)::float8 AS "avgReservationHours"
        FROM reservations r
        JOIN products p ON r.product_id = p._id
        WHERE r.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY p.slug, p.name, p.category, p.price
        ORDER BY count DESC
        LIMIT 10
      `),
    ]);

    return {
      categoryAnalysis: {
        cart: cartInsights.rows.map((row) => ({
          category: row.category,
          totalItems: Number(row.totalItems),
          uniqueUsers: Number(row.uniqueUsers),
          priceRange: {
            min: Number(row.minPrice),
            max: Number(row.maxPrice),
            avg: Number(row.avgPrice),
          },
        })),
        wishlist: wishlistInsights.rows.map((row) => ({
          category: row.category,
          totalItems: Number(row.totalItems),
          uniqueUsers: Number(row.uniqueUsers),
          priceSensitivity: Number(row.priceSensitivity),
        })),
      },
      combined: combinedInsights.rows.map((row) => ({
        slug: row.slug,
        name: row.name,
        category: row.category,
        cartCount: Number(row.cartCount),
        wishlistCount: Number(row.wishlistCount),
        interestScore: Number(row.interestScore),
      })),

      conversionMetrics: await this.getConversionMetrics(),
      // conversionMetrics: this.processConversionData(combinedData.rows),
      highInterestProducts: {
        frequentlyCartAdded: frequentlyCartAdded.rows.map(this.mapProduct),
        frequentlyWishlisted: frequentlyWishlisted.rows.map(this.mapProduct),
        abandonedItems: abandonedItems.rows.map((row) => ({
          slug: row.slug,
          name: row.name,
          stock: Number(row.stock),
          count: Number(row.count),
        })), // New: Reserved items
        reservedItems: frequentlyReserved.rows.map((row) => ({
          ...this.mapProduct(row),
          avgReservationHours: Number(row.avgReservationHours),
        })),
      },
    };
  }

  // Helper methods
  private async getTopProducts(table: string, limit: number) {
    return this.knex.raw<{
      rows: Array<{
        slug: string;
        name: string;
        category: string;
        price: number;
        count: number;
      }>;
    }>(
      `
      SELECT
        p.slug,
        p.name,
        p.category,
        p.price,
        COUNT(*)::integer AS "count"
      FROM ?? t
      JOIN products p ON t.product_id = p._id
      WHERE t.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY p._id, p.name, p.category, p.price
      ORDER BY count DESC
      LIMIT ?
    `,
      [table, limit]
    );
  }

  private async getAbandonedProducts() {
    return this.knex.raw<{
      rows: Array<{
        slug: string;
        name: string;
        stock: number;
        count: number;
      }>;
    }>(`
      SELECT
        p.slug,
        p.name,
        p.stock,
        COUNT(*)::integer AS "count"
      FROM cart_items ci
      JOIN products p ON ci.product_id = p._id
      LEFT JOIN orders o ON ci.user_id = o.user_id AND ci.product_id = o.product_id
      WHERE ci.created_at >= NOW() - INTERVAL '30 days'
        AND o._id IS NULL
      GROUP BY p._id, p.name, p.stock
      ORDER BY count DESC
      LIMIT 10
    `);
  }
  // private async getConversionMetricsOld() {
  //   const rows = await this.knex.raw<{
  //     rows: Array<{
  //       slug: string;
  //       week: number;
  //       year: number;
  //       cartAdds: number;
  //       wishlistAdds: number;
  //       purchases: number;
  //       conversionRate: number;
  //     }>;
  //   }>(`
  //     SELECT
  //       p.slug,
  //       EXTRACT(WEEK FROM COALESCE(ci.created_at, w.created_at, o.created_at))::integer AS "week",
  //       EXTRACT(YEAR FROM COALESCE(ci.created_at, w.created_at, o.created_at))::integer AS "year",
  //       COUNT(DISTINCT ci._id)::integer AS "cartAdds",
  //       COUNT(DISTINCT w._id)::integer AS "wishlistAdds",
  //       COUNT(DISTINCT o._id)::integer AS "purchases",
  //       ROUND(
  //         CASE
  //           WHEN COUNT(DISTINCT ci._id) > 0
  //           THEN (COUNT(DISTINCT o._id)::float / COUNT(DISTINCT ci._id)) * 100
  //           ELSE 0
  //         END::numeric, 2
  //       )::float8 AS "conversionRate"
  //     FROM products p
  //     LEFT JOIN cart_items ci ON p._id = ci.product_id AND ci.created_at >= NOW() - INTERVAL '30 days'
  //     LEFT JOIN wishlist w ON p._id = w.product_id AND w.created_at >= NOW() - INTERVAL '30 days'
  //     LEFT JOIN orders o ON p._id = o.product_id AND o.created_at >= NOW() - INTERVAL '30 days'
  //     GROUP BY p._id, EXTRACT(WEEK FROM COALESCE(ci.created_at, w.created_at, o.created_at)), EXTRACT(YEAR FROM COALESCE(ci.created_at, w.created_at, o.created_at))
  //     ORDER BY conversionRate DESC
  //     LIMIT 100
  //   `);

  //   return this.processConversionData(rows.rows);
  // }
  // Helper: Add reservation conversion to existing method
  private async getConversionMetrics() {
    const rows = await this.knex.raw<{
      rows: Array<{
        slug: string;
        week: number;
        year: number;
        cartAdds: number;
        wishlistAdds: number;
        reservations: number; // New
        purchases: number;
        conversionRate: number;
      }>;
    }>(`
    SELECT
      p.slug,
      EXTRACT(WEEK FROM COALESCE(ci.created_at, w.created_at, r.created_at, o.created_at))::integer AS "week",
      EXTRACT(YEAR FROM COALESCE(ci.created_at, w.created_at, r.created_at, o.created_at))::integer AS "year",
      COUNT(DISTINCT ci._id)::integer AS "cartAdds",
      COUNT(DISTINCT w._id)::integer AS "wishlistAdds",
      COUNT(DISTINCT r._id)::integer AS "reservations", -- New
      COUNT(DISTINCT o._id)::integer AS "purchases",
      ROUND(
        CASE
          WHEN COUNT(DISTINCT ci._id) > 0
          THEN (COUNT(DISTINCT o._id)::float / COUNT(DISTINCT ci._id)) * 100
          ELSE 0
        END::numeric, 2
      )::float8 AS "conversionRate"
    FROM products p
    LEFT JOIN cart_items ci ON p._id = ci.product_id AND ci.created_at >= NOW() - INTERVAL '30 days'
    LEFT JOIN wishlist w ON p._id = w.product_id AND w.created_at >= NOW() - INTERVAL '30 days'
    LEFT JOIN reservations r ON p._id = r.product_id AND r.created_at >= NOW() - INTERVAL '30 days' -- New
    LEFT JOIN orders o ON p._id = o.product_id AND o.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY p._id, EXTRACT(WEEK FROM COALESCE(ci.created_at, w.created_at, r.created_at, o.created_at)), EXTRACT(YEAR FROM COALESCE(ci.created_at, w.created_at, r.created_at, o.created_at))
    ORDER BY conversionRate DESC
    LIMIT 100
  `);

    return this.processConversionData(rows.rows);
  }
  // Update conversion data processor
  private processConversionData(
    rows: Array<{
      slug: string;
      week: number;
      year: number;
      cartAdds: number;
      wishlistAdds: number;
      reservations: number; // New
      purchases: number;
      conversionRate: number;
    }>
  ): ConversionMetrics[] {
    return rows.reduce((acc, curr) => {
      const existing = acc.find((i) => i.product_id === curr.slug);
      const entry = {
        week: Number(curr.week),
        year: Number(curr.year),
        cartAdds: Number(curr.cartAdds),
        wishlistAdds: Number(curr.wishlistAdds),
        reservations: Number(curr.reservations), // New
        purchases: Number(curr.purchases),
        conversionRate: Number(curr.conversionRate),
      };

      if (existing) {
        existing.weeks.push(entry);
      } else {
        acc.push({
          product_id: curr.slug,
          weeks: [entry],
        });
      }
      return acc;
    }, [] as ConversionMetrics[]);
  }

  private mapProduct(row: {
    slug: string;
    name: string;
    category: string;
    price: number;
    count: number;
  }) {
    return {
      slug: row.slug,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      count: Number(row.count),
    };
  }

  private getFirstNumber(
    result: AggregationResultItem[] = [],
    field: string = "total"
  ): number {
    return Number(result[0]?.[field] ?? 0);
  }

  // City Growth Analytics
  private async calculateCityGrowth(
    city: string,
    country: string
  ): Promise<number> {
    const now = DateTime.now();
    const currentPeriodStart = now.minus({ weeks: 1 }).toJSDate();
    const previousPeriodStart = now.minus({ weeks: 2 }).toJSDate();
    const deviceLocation = this.knex<IDeviceFingerprintDB>(
      "device_fingerprints"
    );
    const [currentCountArr, previousCountArr] = await Promise.all([
      deviceLocation
        .clone()
        .where("location_city", city)
        .where("location_country", country)
        .where("created_at", ">=", currentPeriodStart)
        .select<{ count: number }[]>(this.knex.raw("count(*)::int as count")),
      deviceLocation
        .clone()
        .where("location_city", city)
        .where("location_country", country)
        .whereBetween("created_at", [currentPeriodStart, previousPeriodStart])
        .select<{ count: number }[]>(this.knex.raw("count(*)::int as count")),
    ]);

    const currentCount =
      Array.isArray(currentCountArr) && currentCountArr[0]?.count !== undefined
        ? Number(currentCountArr[0].count)
        : 0;
    const previousCount =
      Array.isArray(previousCountArr) &&
      previousCountArr[0]?.count !== undefined
        ? Number(previousCountArr[0].count)
        : 0;

    if (previousCount === 0) {
      return currentCount > 0 ? 100 : 0;
    }

    return Number(
      (((currentCount - previousCount) / previousCount) * 100).toFixed(1)
    );
  }

  // private calculatePercentage(numerator: number, denominator: number): number {
  //   return denominator > 0 ? (numerator / denominator) * 100 : 0;
  // }
}
