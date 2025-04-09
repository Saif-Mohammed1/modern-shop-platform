import type { ApexOptions } from "apexcharts";
import type { FC } from "react";
import Chart from "react-apexcharts";
import { FiAlertCircle } from "react-icons/fi";

import type { DashboardDataApi } from "@/app/lib/types/dashboard.types";

// Type-safe GrowthBadge component
interface GrowthBadgeProps {
  value: number;
}

const GrowthBadge: FC<GrowthBadgeProps> = ({ value }) => {
  const isPositive = value >= 0;
  return (
    <span
      className={`flex items-center px-2 py-1 rounded-md text-sm ${
        isPositive
          ? "bg-green-900/50 text-green-400"
          : "bg-red-900/50 text-red-400"
      }`}
    >
      {isPositive ? "↑" : "↓"}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};
// Updated MetricCard with unit support
interface MetricCardProps {
  icon: React.JSX.Element;
  title: string;
  value: number | string;
  growth?: number;
  isCurrency?: boolean;
  isAlert?: boolean;
  unit?: string;
}

const MetricCard: FC<MetricCardProps> = ({
  icon,
  title,
  value,
  growth,
  isCurrency,
  isAlert,
  unit,
}) => {
  const formattedValue =
    typeof value === "number"
      ? isCurrency
        ? `$${value.toLocaleString()}`
        : value.toLocaleString()
      : value;

  return (
    <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p
            className={`text-2xl font-bold ${isAlert ? "text-yellow-400" : ""}`}
          >
            {formattedValue}
            {unit ? <span className="text-sm ml-1">{unit}</span> : null}
          </p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">{icon}</div>
      </div>
      {growth !== undefined && (
        <div className="mt-4 flex items-center">
          <GrowthBadge value={growth} />
          <span className="text-sm ml-2 text-gray-400">from last week</span>
        </div>
      )}
    </div>
  );
};

interface ChartCardProps {
  title?: string;
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
  helpText?: string;
}

const ChartCard: FC<ChartCardProps> = ({
  title,
  children,
  subtitle,
  className = "",
  helpText,
}) => (
  <div className={`bg-gray-800 p-6 rounded-xl ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <div>
        {title ? <h2 className="text-xl font-semibold">{title}</h2> : null}{" "}
        {subtitle ? (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        ) : null}
      </div>
      {helpText ? (
        <div className="tooltip" data-tip={helpText}>
          <FiAlertCircle className="w-5 h-5 text-gray-400 hover:text-gray-300 cursor-help" />
        </div>
      ) : null}
    </div>
    <div className="relative min-h-[300px]">{children}</div>
  </div>
);

interface CategoryChartProps {
  distribution: Record<string, number>;
}

const CategoryChart: FC<CategoryChartProps> = ({ distribution }) => {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      foreColor: "#fff",
      animations: { enabled: true },
    },
    labels: Object.keys(distribution),
    colors: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    legend: {
      position: "bottom",
      fontSize: "14px",
      markers: { size: 4 },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "16px",
              color: "#fff",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  const series = Object.values(distribution);

  return <Chart options={options} series={series} type="donut" height={350} />;
};

// interface ActivityItem {
//   _id: string;
//   amount?: number;
//   totalPrice?: number;
//   status: string;
//   createdAt: Date;
//   type?: "refund" | "order" | "report";
// }

// interface RecentActivitiesProps {
//   title: string;
//   data: ActivityItem[];
//   icon: React.JSX.Element;
//   loading?: boolean;
//   error?: string;
//   onRetry?: () => void;
// }

// const RecentActivities: FC<RecentActivitiesProps> = ({
//   title,
//   data,
//   icon,
//   loading = false,
//   error,
//   onRetry,
// }) => (
//   <div className="bg-gray-800 p-6 rounded-xl">
//     <div className="flex items-center justify-between mb-4">
//       <h3 className="text-lg font-semibold">{title}</h3>
//       {icon}
//     </div>

//     {error ? (
//       <div className="text-center py-4">
//         <p className="text-red-400 mb-2">Error loading activities</p>
//         {onRetry && (
//           <button
//             onClick={onRetry}
//             className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
//           >
//             <FiRefreshCw className="w-4 h-4" />
//             Try Again
//           </button>
//         )}
//       </div>
//     ) : loading ? (
//       <div className="space-y-4">
//         {[...Array(3)].map((_, i) => (
//           <div key={i} className="h-16 bg-gray-700 rounded-lg animate-pulse" />
//         ))}
//       </div>
//     ) : data.length === 0 ? (
//       <div className="text-center py-4">
//         <p className="text-gray-400">No recent activities</p>
//         <p className="text-sm text-gray-500 mt-1">Check back later</p>
//       </div>
//     ) : (
//       <div className="space-y-4">
//         {data.map((activity) => (
//           <div
//             key={activity._id}
//             className="flex items-center justify-between bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
//           >
//             <div>
//               <p className="font-medium">#{activity._id.slice(-4)}</p>
//               <p className="text-sm text-gray-400">
//                 {new Date(activity.createdAt).toLocaleDateString("en-US", {
//                   month: "short",
//                   day: "numeric",
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </p>
//             </div>
//             <div className="text-right">
//               {(activity.amount || activity.totalPrice) && (
//                 <p
//                   className={`font-semibold ${
//                     activity.type === "refund"
//                       ? "text-red-400"
//                       : "text-green-400"
//                   }`}
//                 >
//                   {activity.type === "refund" ? "-" : "+"}$
//                   {(activity.amount || activity.totalPrice)?.toFixed(2)}
//                 </p>
//               )}
//               <p className="text-sm text-gray-400 capitalize">
//                 {activity.status}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     )}

//     {data.length > 0 && (
//       <button className="w-full mt-4 text-indigo-400 hover:text-indigo-300 text-sm flex items-center justify-center gap-2">
//         View All Activities
//         <FiChevronRight className="w-4 h-4" />
//       </button>
//     )}
//   </div>
// );
// Revenue Trend Chart Component
const RevenueTrendChart: FC<{
  weeklyGrowth: DashboardDataApi["orders"]["weeklyGrowth"];
}> = ({ weeklyGrowth }) => {
  const options: ApexOptions = {
    chart: { type: "area", toolbar: { show: false } },
    xaxis: { categories: weeklyGrowth.map((w) => w.label) },
    yaxis: {
      labels: { formatter: (val: number) => `$${val.toLocaleString()}` },
    },
    colors: ["#4F46E5"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    tooltip: { theme: "dark" },
  };

  return (
    <Chart
      options={options}
      series={[
        { name: "Revenue", data: weeklyGrowth.map((w) => w.currentRevenue) },
      ]}
      type="area"
      height={350}
    />
  );
};

// Category Sales Chart Component
const CategorySalesChart: FC<{
  categories: DashboardDataApi["products"]["categories"];
}> = ({ categories }) => {
  const options: ApexOptions = {
    chart: { type: "donut" },
    labels: categories.map((c) => c.name),
    colors: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    legend: { position: "bottom" },
  };

  return (
    <Chart
      options={options}
      series={categories.map((c) => c.sales)}
      type="donut"
      height={350}
    />
  );
};

// Recent Orders Component
const RecentOrders: FC<{
  orders: DashboardDataApi["orders"]["recentOrders"];
}> = ({ orders }) => (
  <ChartCard title="Recent Orders">
    <div className="space-y-4">
      {orders.slice(0, 5).map((order) => (
        <div
          key={String(order._id)}
          className="flex justify-between items-center bg-gray-700 p-3 rounded-lg"
        >
          <div>
            <p className="font-medium">Order #{String(order._id).slice(-6)}</p>
            <p className="text-sm text-gray-400">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">${order.total.toLocaleString()}</p>
            <p className="text-sm text-gray-400 capitalize">{order.status}</p>
          </div>
        </div>
      ))}
    </div>
  </ChartCard>
);

// Security Overview Component
const SecurityOverview: FC<{
  security: DashboardDataApi["users"]["security"];
}> = ({ security }) => (
  <ChartCard title="Security Overview">
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-gray-700 rounded-lg">
        <p className="text-2xl font-bold">{security.twoFactorAdoption}%</p>
        <p className="text-gray-400">2FA Adoption</p>
      </div>
      <div className="p-4 bg-gray-700 rounded-lg">
        <p className="text-2xl font-bold">{security.threats.botAttempts}</p>
        <p className="text-gray-400">Bot Attempts (24h)</p>
      </div>
    </div>
  </ChartCard>
);

// Device Distribution Chart Component
const DeviceDistributionChart: FC<{
  devices: DashboardDataApi["users"]["geographicalInsights"]["deviceDistribution"];
}> = ({ devices }) => {
  const options: ApexOptions = {
    chart: { type: "polarArea" },
    labels: devices.map((d) => d.device),
    colors: ["#4F46E5", "#10B981", "#F59E0B"],
    legend: { position: "bottom" },
  };

  return (
    <Chart
      options={options}
      series={devices.map((d) => d.count)}
      type="polarArea"
      height={350}
    />
  );
};

// Inventory Value Chart Component
const InventoryValueChart: FC<{
  inventory: DashboardDataApi["products"]["inventory"];
}> = ({ inventory }) => {
  const options: ApexOptions = {
    chart: { type: "radialBar" },
    labels: ["Inventory Value"],
    colors: ["#4F46E5"],
    plotOptions: {
      radialBar: {
        dataLabels: {
          value: { formatter: (val: number) => `$${val.toLocaleString()}` },
        },
      },
    },
  };

  return (
    <Chart
      options={options}
      series={[inventory.totalValue]}
      type="radialBar"
      height={350}
    />
  );
};

// Geographical Map Component (Simplified)
const GeographicalMap: FC<{
  locations: DashboardDataApi["users"]["geographicalInsights"]["topLocations"];
}> = ({ locations }) => (
  <ChartCard>
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {locations.map((loc, index) => (
        <div key={index} className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="font-medium">
              {loc.city}, {loc.country}
            </span>
            <span className="text-indigo-400">{loc.growthPercentage}%</span>
          </div>
          <div className="text-sm text-gray-400">
            {loc.uniqueUsers} users • {loc.logins} logins
          </div>
        </div>
      ))}
    </div>
  </ChartCard>
);

// Top Products Table Component
const TopProductsTable: FC<{
  products: DashboardDataApi["orders"]["topProducts"];
}> = ({ products }) => (
  <ChartCard title="Top Selling Products">
    <div className=" overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 text-sm">
            <th className="pb-3">Product</th>
            <th className="pb-3">Units Sold</th>
            <th className="pb-3">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.productId} className="border-t border-gray-700">
              <td className="py-3">{product.name}</td>
              <td className="py-3">{product.unitsSold}</td>
              <td className="py-3">${product.revenue.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </ChartCard>
);

// User Activity Analysis Component
const UserActivityAnalysis: FC<{
  userInterest: DashboardDataApi["userInterestProducts"];
}> = ({ userInterest }) => (
  <ChartCard title="User Activity Analysis">
    <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Cart Activity</h3>
        <div className=" max-h-[70vh] overflow-y-auto">
          {userInterest.categoryAnalysis.cart.map((category) => (
            <div key={category.category} className="mb-3">
              <div className="flex justify-between text-sm">
                <span>{category.category}</span>
                <span>{category.totalItems}</span>
              </div>
              <div className="h-1 bg-gray-600 rounded-full">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{
                    width: `${(category.totalItems / userInterest.categoryAnalysis.cart.reduce((acc, curr) => acc + curr.totalItems, 0)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Wishlist Activity</h3>
        <div className=" max-h-[70vh] overflow-y-auto">
          {userInterest.categoryAnalysis.wishlist.map((category) => (
            <div key={category.category} className="mb-3">
              <div className="flex justify-between text-sm">
                <span>{category.category}</span>
                <span>{category.totalItems}</span>
              </div>
              <div className="h-1 bg-gray-600 rounded-full">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${(category.totalItems / userInterest.categoryAnalysis.wishlist.reduce((acc, curr) => acc + curr.totalItems, 0)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </ChartCard>
);
export {
  GrowthBadge,
  MetricCard,
  ChartCard,
  CategoryChart,
  RevenueTrendChart,
  CategorySalesChart,
  RecentOrders,
  SecurityOverview,
  DeviceDistributionChart,
  InventoryValueChart,
  GeographicalMap,
  TopProductsTable,
  UserActivityAnalysis,
};
