import type { FC } from "react";
import {
  FiBarChart2,
  FiGlobe,
  FiMapPin,
  FiPieChart,
  FiRefreshCw,
} from "react-icons/fi";

import type { DashboardDataApi } from "@/app/lib/types/dashboard.types";

import MetricCard from "./MetricCard";

import {
  //   MetricCard,
  ChartCard,
  DeviceDistributionChart,
  GeographicalMap,
  InventoryValueChart,
  TopProductsTable,
  UserActivityAnalysis,
  CategorySalesChart,
} from ".";


interface RefundAnalytics {
  total: number;
  totalAmount: number;
  approvalRate: number;
  avgProcessingTime: number;
}
const RefundOverview: FC<{ refunds: RefundAnalytics }> = ({ refunds }) => (
  <ChartCard title="Refund Analytics">
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-gray-700 rounded-lg">
        <p className="text-2xl font-bold">{refunds?.total ?? 0}</p>
        <p className="text-gray-400">Total Refunds</p>
      </div>
      <div className="p-4 bg-gray-700 rounded-lg">
        <p className="text-2xl font-bold">
          ${refunds?.totalAmount?.toLocaleString() ?? "0"}
        </p>
        <p className="text-gray-400">Total Refunded Amount</p>
      </div>
      <div className="p-4 bg-gray-700 rounded-lg">
        <p className="text-2xl font-bold">{refunds?.approvalRate ?? 0}%</p>
        <p className="text-gray-400">Approval Rate</p>
      </div>
      <div className="p-4 bg-gray-700 rounded-lg">
        <p className="text-2xl font-bold">
          {refunds?.avgProcessingTime ?? 0} days
        </p>
        <p className="text-gray-400">Avg Processing Time</p>
      </div>
    </div>
  </ChartCard>
);
const AdvancedView = ({ data }: { data: DashboardDataApi }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
      <MetricCard
        icon={<FiGlobe className="h-5 w-5 md:h-6 md:w-6" />}
        title="Active Cities"
        value={data.users.geographicalInsights.totalCities}
      />
      <MetricCard
        icon={<FiRefreshCw className="h-5 w-5 md:h-6 md:w-6" />}
        title="Refund Rate"
        value={data.refunds.approvalRate}
        unit="%"
      />
      <MetricCard
        icon={<FiPieChart className="h-5 w-5 md:h-6 md:w-6" />}
        title="Product Ratings"
        value={data.products.engagement.avgRating}
        unit="/5"
      />
      <MetricCard
        icon={<FiMapPin className="h-5 w-5 md:h-6 md:w-6" />}
        title="Order Cities"
        value={data.orders.topLocations.length}
      />
      <MetricCard
        icon={<FiBarChart2 className="h-5 w-5 md:h-6 md:w-6" />}
        title="Avg LTV"
        value={data.orders.customerBehavior.avgLTV}
        isCurrency
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
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

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4 md:space-y-6">
        <RefundOverview refunds={data.refunds} />
        <TopProductsTable products={data.orders.topProducts} />
      </div>
      <div className="space-y-4 md:space-y-6">
        <GeographicalMap
          locations={data.users.geographicalInsights.topLocations}
        />
        <UserActivityAnalysis userInterest={data.userInterestProducts} />
      </div>
    </div>
  </>
);

export default AdvancedView;
