// import AppError from "@/components/util/appError";
import type { Metadata } from "next";
import { headers } from "next/headers";

import type { DashboardDataApi } from "@/app/lib/types/dashboard.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import Dashboard from "@/components/(admin)/dashboard/dashboard";
import ErrorHandler from "@/components/Error/errorHandler";
import { dashboardTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/dashboardTranslate";

// export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: dashboardTranslate.metadata[lang].title,
  description: dashboardTranslate.metadata[lang].description,
  keywords: dashboardTranslate.metadata[lang].keywords,
};
const GET_DASHBOARD = /* GraphQL */ `
  query {
    getDashboardData {
      users {
        totalUsers
        activeUsers
        recentSignups
        languageDistribution {
          language
          count
        }
        geographicalInsights {
          topLocations {
            city
            country
            logins
            uniqueUsers
            commonDevices
            commonBrowsers
            coordinates {
              lat
              lng
            }
            growthPercentage
          }
          deviceDistribution {
            count
            device
            os
            citiesCoverage
          }
          totalCities
        }
        security {
          twoFactorAdoption
          lockedAccounts
          highRiskUsers
          authActivity {
            loginsLast24h
            failedAttempts
            uniqueLocations
          }
          threats {
            impossible_travel
            suspiciousDevices
            botAttempts
          }
          rateLimits {
            activeLockouts
            passwordResetAttempts
          }
          trends {
            date
            attempts
            successRate
          }
        }
        deviceDiversity {
          totalDevices
        }
        weeklyGrowth {
          label
          currentLogins
          previousLogins
          growthPercentage
        }
      }
      orders {
        summary {
          totalOrders
          completedOrders
          avgOrderValue
          totalRevenue
          avgItemsPerOrder
        }
        financialHealth {
          netRevenue
          totalTax
          refundRate
          weeklyGrowth
        }
        customerBehavior {
          repeatRate
          avgLTV
          topSpender
        }
        topProducts {
          product_id
          name
          unitsSold
          revenue
        }
        trends {
          monthly {
            period
            orders
            revenue
            aov
          }
          yoyGrowth
          weeklyBreakdown {
            week
            current
            previous
            growth
          }
        }
        fulfillment {
          statusDistribution {
            status
            count
            avgHours
          }
          slaCompliance
        }
        paymentMethods {
          method
          usageCount
          totalProcessed
        }
        topLocations {
          city
          state
          country
          orderCount
          revenue
        }
        recentOrders {
          _id
          status
          total
          created_at
          items {
            name
            price
            quantity
          }
        }
        weeklyGrowth {
          label
          orderGrowth
          revenueGrowth
          currentOrders
          currentRevenue
        }
      }
      products {
        inventory {
          total
          outOfStock
          lowStock
          active
          totalValue
          reservedValue
        }
        sales {
          totalSold
          totalRevenue
          avgSales
          topSelling
        }
        discounts {
          active
          expiringSoon
          avgDiscount
        }
        engagement {
          avgRating
          totalReviews
          recentReviews
        }
        categories {
          name
          count
          sales
          avgPrice
          avgStock
        }
        recentChanges {
          slug
          name
          type
          modifiedBy
        }
        shipping {
          avgWeight
          totalVolume
        }
        risk {
          stockConflicts
        }
        weeklyGrowth {
          label
          salesGrowth
          currentSales
          previousSales
          currentRevenue
          revenueGrowth
          previousRevenue
        }
        reservations {
          reservedQuantity
          reservedValue
          avgReservationDuration
          conversionRate
          abandonmentRate
        }
      }
      refunds {
        total
        totalAmount
        approvalRate
        avgProcessingTime
        weeklyTrend {
          week
          data {
            key
            value
          }
        }
        commonReasons {
          reason
          frequency
          financialImpact
        }
        recentRefunds {
          _id
          amount
          status
          user
          created_at
          invoice_id
        }
        weeklyGrowth {
          label
          amountGrowth
          countGrowth
          currentAmount
          currentCount
        }
        highRiskRefunds {
          count
        }
        financialImpact {
          totalRefunded
          avgRefund
          maxRefund
        }
      }
      reports {
        total
        resolved
        resolutionRate
        avgResolutionTime
        statusBreakdown {
          status
          count
        }
        trendingIssues {
          issue
          count
          affectedProducts
        }
        recentReports {
          _id
          issue
          status
          product
          reporter
          created_at
        }
        dailyTrend {
          date
          reports
        }
        weeklyTrends {
          label
          resolutionGrowth
          reportGrowth
          currentResolved
          currentTotal
        }
      }
      userInterestProducts {
        categoryAnalysis {
          cart {
            category
            totalItems
            uniqueUsers
            priceRange {
              min
              max
              avg
            }
          }
          wishlist {
            category
            totalItems
            uniqueUsers
            priceSensitivity
          }
        }
        conversionMetrics {
          product_id
          weeks {
            week
            cartAdds
            purchases
            conversionRate
          }
        }
        combined {
          slug
          name
          category
          cartCount
          wishlistCount
          interestScore
        }
        highInterestProducts {
          frequentlyCartAdded {
            slug
            count
            name
            category
            price
          }
          frequentlyWishlisted {
            slug
            count
            name
            category
            price
          }
          abandonedItems {
            slug
            count
            name
            stock
          }
        }
      }
    }
  }
`;
const page = async () => {
  const headersObj = Object.fromEntries((await headers()).entries());
  try {
    const { getDashboardData } = await api_gql<{
      getDashboardData: DashboardDataApi;
    }>(GET_DASHBOARD, undefined, headersObj);
    return <Dashboard dashboardData={getDashboardData} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
