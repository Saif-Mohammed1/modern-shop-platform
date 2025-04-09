"use client";

import { useState } from "react";
import {
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiGlobe,
  FiGrid,
  FiMapPin,
  FiPackage,
  FiPieChart,
  FiRefreshCw,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import type { DashboardDataApi } from "@/app/lib/types/dashboard.types";

import {
  CategoryChart,
  CategorySalesChart,
  ChartCard,
  DeviceDistributionChart,
  GeographicalMap,
  InventoryValueChart,
  MetricCard,
  RecentOrders,
  RevenueTrendChart,
  SecurityOverview,
  TopProductsTable,
  UserActivityAnalysis,
} from ".";
const AdvancedView = ({ data }: { data: DashboardDataApi }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <MetricCard
        icon={<FiGlobe className="h-6 w-6" />}
        title="Active Cities"
        value={data.users.geographicalInsights.totalCities}
      />
      <MetricCard
        icon={<FiRefreshCw className="h-6 w-6" />}
        title="Refund Rate"
        value={data.refunds.approvalRate}
        unit="%"
      />
      <MetricCard
        icon={<FiPieChart className="h-6 w-6" />}
        title="Product Ratings"
        value={data.products.engagement.avgRating}
        unit="/5"
      />
      <MetricCard
        icon={<FiMapPin className="h-6 w-6" />}
        title="Order Cities"
        value={data.orders.topLocations.length}
      />
      <MetricCard
        icon={<FiBarChart2 className="h-6 w-6" />}
        title="Avg LTV"
        value={data.orders.customerBehavior.avgLTV}
        isCurrency
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <ChartCard title="Device Distribution">
        <DeviceDistributionChart
          devices={data.users.geographicalInsights.deviceDistribution}
        />
      </ChartCard>
      <ChartCard title="Category Sales">
        <CategorySalesChart categories={data.products.categories} />
      </ChartCard>
      <ChartCard title="Inventory Value">
        <InventoryValueChart inventory={data.products.inventory} />
      </ChartCard>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TopProductsTable products={data.orders.topProducts} />
      <div className="space-y-6">
        <UserActivityAnalysis userInterest={data.userInterestProducts} />
        <GeographicalMap
          locations={data.users.geographicalInsights.topLocations}
        />
      </div>
    </div>
  </>
);
const BasicView = ({ data }: { data: DashboardDataApi }) => {
  const paymentDistribution = data.orders.paymentMethods.reduce(
    (acc, method) => ({ ...acc, [method.method]: method.usageCount }),
    {}
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<FiUsers className="h-6 w-6" />}
          title="Active Users"
          value={data.users.activeUsers}
          growth={parseFloat(
            data.users.weeklyGrowth[0]?.growthPercentage || "0"
          )}
        />
        <MetricCard
          icon={<FiPackage className="h-6 w-6" />}
          title="Low Stock"
          value={data.products.inventory.lowStock}
          isAlert
        />
        <MetricCard
          icon={<FiDollarSign className="h-6 w-6" />}
          title="Net Revenue"
          value={data.orders.financialHealth.netRevenue}
          isCurrency
        />
        <MetricCard
          icon={<FiShield className="h-6 w-6" />}
          title="2FA Adoption"
          value={data.users.security.twoFactorAdoption}
          unit="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Revenue Trends">
          <RevenueTrendChart weeklyGrowth={data.orders.weeklyGrowth} />
        </ChartCard>
        <ChartCard title="Payment Methods">
          <CategoryChart distribution={paymentDistribution} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={data.orders.recentOrders} />
        <SecurityOverview security={data.users.security} />
      </div>
    </>
  );
};
const AdminDashboard = ({
  dashboardData,
}: {
  dashboardData: DashboardDataApi | null;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!dashboardData) {
    return <div className="text-gray-500 p-6">Loading dashboard data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => {
              setShowAdvanced(!showAdvanced);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {showAdvanced ? (
              <>
                <FiGrid className="w-5 h-5" />
                Basic View
                <FiChevronLeft className="w-5 h-5" />
              </>
            ) : (
              <>
                <FiBarChart2 className="w-5 h-5" />
                Advanced View
                <FiChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {showAdvanced ? (
          <AdvancedView data={dashboardData} />
        ) : (
          <BasicView data={dashboardData} />
        )}
      </div>
    </div>
  );
};
export default AdminDashboard;
