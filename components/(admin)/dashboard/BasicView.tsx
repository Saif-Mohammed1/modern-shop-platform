import { FiDollarSign, FiPackage, FiShield, FiUsers } from "react-icons/fi";

import type { DashboardDataApi } from "@/app/lib/types/dashboard.types";

import MetricCard from "./MetricCard";

import {
  //   MetricCard,
  ChartCard,
  RevenueTrendChart,
  CategoryChart,
  RecentOrders,
  SecurityOverview,
} from ".";


const BasicView = ({ data }: { data: DashboardDataApi }) => {
  const paymentDistribution = data.orders.paymentMethods.reduce(
    (acc, method) => ({ ...acc, [method.method]: method.usageCount }),
    {}
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <MetricCard
          icon={<FiUsers className="h-5 w-5 md:h-6 md:w-6" />}
          title="Active Users"
          value={data.users.activeUsers}
          growth={parseFloat(
            data.users.weeklyGrowth[0]?.growthPercentage || "0"
          )}
        />
        <MetricCard
          icon={<FiPackage className="h-5 w-5 md:h-6 md:w-6" />}
          title="Low Stock"
          value={data.products.inventory.lowStock}
          isAlert
        />
        <MetricCard
          icon={<FiDollarSign className="h-5 w-5 md:h-6 md:w-6" />}
          title="Net Revenue"
          value={data.orders.financialHealth.netRevenue}
          isCurrency
        />
        <MetricCard
          icon={<FiShield className="h-5 w-5 md:h-6 md:w-6" />}
          title="2FA Adoption"
          value={data.users.security.twoFactorAdoption}
          unit="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <ChartCard title="Revenue Trends">
          <RevenueTrendChart weeklyGrowth={data.orders.weeklyGrowth} />
        </ChartCard>
        <ChartCard title="Payment Methods">
          <CategoryChart distribution={paymentDistribution} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <RecentOrders orders={data.orders.recentOrders} />
        <SecurityOverview security={data.users.security} />
      </div>
    </>
  );
};

export default BasicView;
