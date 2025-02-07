"use client";
// import { Line } from "react-chartjs-2";
// import {
//   FaUsers,
//   FaBox,
//   FaMoneyBillWave,
//   FaFileAlt,
//   FaUndoAlt,
// } from "react-icons/fa"; // Import Icons
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ChartData,
//   ChartOptions,
// } from "chart.js";
// import { FC } from "react";
// import { dashboardTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/dashboardTranslate";
// import { lang } from "@/components/util/lang";

// // Register chart components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );
// type DashboardProps = {
//   dashboardData: {
//     users: {
//       count: number;
//       growth: number;
//     };
//     orders: {
//       count: number;
//       earnings: number;
//     };
//     reports: {
//       count: number;
//       growth: number;
//     };
//     refunds: {
//       count: number;
//       loss: number;
//     };
//     products: {
//       count: number;
//       growth: number;
//     };
//   };
// };
/*
// const Dashboard: FC<DashboardProps> = ({ dashboardData }) => {
//   if (!dashboardData) {
//     return <p>{dashboardTranslate.dashboard[lang]["empty-data"]}</p>;
//   }

//   const { users, orders, reports, refunds, products } = dashboardData;

//   // Helper to calculate percentage growth
//   const calcGrowth = (current: number, previous: number) => {
//     return previous ? ((current - previous) / previous) * 100 : 0;
//   };

//   // Growth percentages
//   const userGrowthPercent = calcGrowth(users.count, users.growth);
//   const productGrowthPercent = calcGrowth(products.count, products.growth);

//   // Chart Data
//   const chartData: ChartData<"line"> = {
//     labels: dashboardTranslate.dashboard[lang].chartData.labels.slice(), // [...dashboardTranslate.dashboard[lang].chartData.labels], //["Earnings", "Losses"],
//     datasets: [
//       {
//         label: dashboardTranslate.dashboard[lang].chartData.datasets.label, //"Transactions",
//         data: [orders.earnings, refunds.loss],
//         backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 99, 132, 0.2)"],
//         borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const chartOptions: ChartOptions<"line"> = {
//     scales: {
//       y: {
//         beginAtZero: true,
//       },
//     },
//   };

//   return (
//     <div className="p-8 bg-gray-100 ">
//       <h1 className="text-3xl font-bold mb-6">
//         {dashboardTranslate.dashboard[lang].title}
//       </h1>
//       <div className="max-h-[80vh] overflow-y-auto">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
//           {/* Users */
//           <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
//             <FaUsers size={40} className="text-blue-500" />
//             <div>
//               <h2 className="text-xl font-bold">
//                 {dashboardTranslate.dashboard[lang].statistic.users.title}
//               </h2>
//               <p>
//                 {dashboardTranslate.dashboard[lang].statistic.users.total}:{" "}
//                 {users.count}
//               </p>
//               <p
//                 className={
//                   userGrowthPercent > 0 ? "text-green-500" : "text-red-500"
//                 }
//               >
//                 {dashboardTranslate.dashboard[lang].statistic.users.growth}:{" "}
//                 {userGrowthPercent.toFixed(2)}%
//               </p>
//             </div>
//           </div>

//           {/* Orders */}
//           <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
//             <FaMoneyBillWave size={40} className="text-green-500" />
//             <div>
//               <h2 className="text-xl font-bold">
//                 {dashboardTranslate.dashboard[lang].statistic.orders.title}
//               </h2>
//               <p>
//                 {dashboardTranslate.dashboard[lang].statistic.orders.total}:{" "}
//                 {orders.count}
//               </p>
//               <p>
//                 {dashboardTranslate.dashboard[lang].statistic.orders.earnings}:
//                 ${orders.earnings}
//               </p>
//             </div>
//           </div>

//           {/* Products */}
//           <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
//             <FaBox size={40} className="text-orange-500" />
//             <div>
//               <h2 className="text-xl font-bold">
//                 {dashboardTranslate.dashboard[lang].statistic.products.title}
//               </h2>
//               <p>
//                 {dashboardTranslate.dashboard[lang].statistic.products.total}:{" "}
//                 {products.count}
//               </p>
//               <p
//                 className={
//                   productGrowthPercent > 0 ? "text-green-500" : "text-red-500"
//                 }
//               >
//                 {dashboardTranslate.dashboard[lang].statistic.products.growth}:{" "}
//                 {productGrowthPercent.toFixed(2)}%
//               </p>
//             </div>
//           </div>

//           {/* Reports */}
//           <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
//             <FaFileAlt size={40} className="text-purple-500" />
//             <div>
//               <h2 className="text-xl font-bold">
//                 {dashboardTranslate.dashboard[lang].statistic.reports.title}
//               </h2>
//               <p>
//                 {dashboardTranslate.dashboard[lang].statistic.reports.total}:{" "}
//                 {reports.count}
//               </p>
//               <p>
//                 {dashboardTranslate.dashboard[lang].statistic.reports.growth}:{" "}
//                 {reports.growth}
//               </p>
//             </div>
//           </div>

//           {/* Refunds */}
//           <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
//             <FaUndoAlt size={40} className="text-red-500" />
//             <div>
//               <h2 className="text-xl font-bold">
//                 {dashboardTranslate.dashboard[lang].statistic.refunds.title}
//               </h2>
//               <p>
//                 {dashboardTranslate.dashboard[lang].statistic.refunds.total}:{" "}
//                 {refunds.count}
//               </p>
//               <p>
//                 {dashboardTranslate.dashboard[lang].statistic.refunds.loss}: $
//                 {refunds.loss}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="p-6 bg-white rounded-lg shadow-md ">
//           <h2 className="text-xl font-bold mb-4">Earnings vs Losses</h2>
//           <Line data={chartData} options={chartOptions} />
//         </div>
//       </div>
//     </div>
//   );
// };

// import { FC, useState } from "react";
// import {
//   FiUsers,
//   FiDollarSign,
//   FiPackage,
//   FiAlertCircle,
//   FiShoppingCart,
//   FiRefreshCw,
// } from "react-icons/fi";
// import Chart from "react-apexcharts";
// import { DashboardData } from "@/app/_server/controller/adminDashboardController";
// import { ApexOptions } from "apexcharts";

// const AdminDashboard = ({
//   dashboardData,
// }: {
//   dashboardData: DashboardData | null;
// }) => {
//   const [data, setData] = useState<DashboardData | null>(dashboardData || null);
//   if (!data) return <div className="text-gray-500 p-6">No data available</div>;

//   return (
//     <div className="min-h-screen bg-gray-900 text-gray-100 p-6 rounded-md">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

//         {/* Key Metrics Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <MetricCard
//             icon={<FiUsers className="h-6 w-6" />}
//             title="Total Users"
//             value={data.users.total}
//             growth={data.users.growthPercentage}
//           />

//           <MetricCard
//             icon={<FiDollarSign className="h-6 w-6" />}
//             title="Total Earnings"
//             value={`${data.orders.earnings.current.toLocaleString()}`}
//             growth={data.orders.earnings.trend}
//             isCurrency
//           />

//           <MetricCard
//             icon={<FiPackage className="h-6 w-6" />}
//             title="Stock Alerts"
//             value={data.inventory.stockAlerts}
//             trend={-data.products.growthPercentage}
//             isAlert
//           />

//           <MetricCard
//             icon={<FiAlertCircle className="h-6 w-6" />}
//             title="Pending Reports"
//             value={data.reports.unresolved}
//             growth={data.reports.resolutionRate}
//           />
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           <div className="bg-gray-800 p-6 rounded-xl">
//             <h2 className="text-xl font-semibold mb-4">Earnings Overview</h2>
//             <EarningsChart data={data.orders.earnings} />
//           </div>

//           <div className="bg-gray-800 p-6 rounded-xl">
//             <h2 className="text-xl font-semibold mb-4">Product Categories</h2>
//             <CategoryChart distribution={data.products.categoryDistribution} />
//           </div>
//         </div>

//         {/* Recent Activities */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <RecentActivities
//             title="Recent Orders"
//             data={data.recentActivities.orders}
//             icon={<FiShoppingCart className="h-5 w-5" />}
//           />
//           <RecentActivities
//             title="Recent Refunds"
//             data={data.recentActivities.refunds}
//             icon={<FiRefreshCw className="h-5 w-5" />}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };
import { FC, useState } from "react";
import {
  FiUsers,
  FiDollarSign,
  FiPackage,
  FiAlertCircle,
  FiShoppingCart,
  FiRefreshCw,
  FiChevronRight,
  FiChevronLeft,
  FiGrid,
  FiBarChart2,
} from "react-icons/fi";
import Chart from "react-apexcharts";
import { DashboardData } from "@/app/_server/controller/adminDashboardController";
import { ApexOptions } from "apexcharts";

const AdminDashboard = ({
  dashboardData,
}: {
  dashboardData: DashboardData | null;
}) => {
  const [data, setData] = useState<DashboardData | null>(dashboardData || null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!data) return <div className="text-gray-500 p-6">No data available</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 rounded-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
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
          <AdvancedView data={data} />
        ) : (
          <BasicView data={data} />
        )}
      </div>
    </div>
  );
};

const BasicView = ({ data }: { data: DashboardData }) => (
  <>
    {/* Basic Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        icon={<FiUsers className="h-6 w-6" />}
        title="Total Users"
        value={data.users.total}
        growth={data.users.growthPercentage}
      />
      <MetricCard
        icon={<FiDollarSign className="h-6 w-6" />}
        title="Total Earnings"
        value={`${data.orders.earnings.current.toLocaleString()}`}
        growth={data.orders.earnings.trend}
        isCurrency
      />
      <MetricCard
        icon={<FiPackage className="h-6 w-6" />}
        title="Stock Alerts"
        value={data.inventory.stockAlerts}
        trend={-data.products.growthPercentage}
        isAlert
      />
      <MetricCard
        icon={<FiAlertCircle className="h-6 w-6" />}
        title="Pending Reports"
        value={data.reports.unresolved}
        growth={data.reports.resolutionRate}
      />
    </div>

    {/* Basic Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <ChartCard title="Earnings Overview">
        <EarningsChart data={data.orders.earnings} />
      </ChartCard>
      <ChartCard title="Product Categories">
        <CategoryChart distribution={data.products.categoryDistribution} />
      </ChartCard>
    </div>

    {/* Recent Activities */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentActivities
        title="Recent Orders"
        data={data.recentActivities.orders}
        icon={<FiShoppingCart className="h-5 w-5" />}
      />
      <RecentActivities
        title="Recent Refunds"
        data={data.recentActivities.refunds}
        icon={<FiRefreshCw className="h-5 w-5" />}
      />
    </div>
  </>
);

const AdvancedView = ({ data }: { data: DashboardData }) => (
  <>
    {/* Advanced Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <MetricCard
        icon={<FiUsers className="h-6 w-6" />}
        title="Active Users"
        value={data.users.active}
        growth={data.users.growthPercentage}
      />
      <MetricCard
        icon={<FiDollarSign className="h-6 w-6" />}
        title="Daily Earnings"
        value={`${data.orders.earnings.daily.toLocaleString()}`}
        isCurrency
      />
      <MetricCard
        icon={<FiPackage className="h-6 w-6" />}
        title="Low Stock"
        value={data.products.lowStock}
        trend={-data.products.growthPercentage}
      />
      <MetricCard
        icon={<FiAlertCircle className="h-6 w-6" />}
        title="Resolved Reports"
        value={data.reports.resolved}
        growth={data.reports.resolutionRate}
      />
      <MetricCard
        icon={<FiShoppingCart className="h-6 w-6" />}
        title="Daily Orders"
        value={data.dailyOrders}
        growth={data.sales.conversionRate}
      />
    </div>

    {/* Advanced Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <ChartCard title="Sales Conversion Rate">
        <ConversionChart conversionRate={data.sales.conversionRate} />
      </ChartCard>
      <ChartCard title="Inventory Value">
        <InventoryChart totalValue={data.inventory.totalValue} />
      </ChartCard>
      <ChartCard title="User Interests">
        <InterestChart interests={data.userInterestProducts} />
      </ChartCard>
    </div>

    {/* Advanced Data Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <TopProductsTable products={data.topOrderedProducts} />
      <RefundAnalysis refunds={data.refunds} />
    </div>
  </>
);

// New Components for Advanced View
const ConversionChart: FC<{ conversionRate: number }> = ({
  conversionRate,
}) => {
  const options: ApexOptions = {
    chart: { type: "radialBar" },
    plotOptions: {
      radialBar: {
        hollow: { size: "70%" },
        dataLabels: {
          name: { color: "#fff" },
          value: { color: "#fff", fontSize: "24px" },
        },
      },
    },
    labels: ["Conversion Rate"],
    colors: ["#4F46E5"],
  };

  return (
    <Chart
      options={options}
      series={[conversionRate]}
      type="radialBar"
      height={350}
    />
  );
};

const InventoryChart: FC<{ totalValue: number }> = ({ totalValue }) => {
  const options: ApexOptions = {
    chart: { type: "bar" },
    xaxis: { categories: ["Inventory Value"] },
    yaxis: {
      labels: { formatter: (val: number) => `$${val.toLocaleString()}` },
    },
    colors: ["#4F46E5"],
  };

  return (
    <Chart
      options={options}
      series={[{ data: [totalValue] }]}
      type="bar"
      height={350}
    />
  );
};

const InterestChart: FC<{
  interests: Array<{ productId: string; count: number }>;
}> = ({ interests }) => {
  const options: ApexOptions = {
    chart: { type: "heatmap" },
    dataLabels: { enabled: false },
    colors: ["#4F46E5"],
    xaxis: { type: "category", categories: interests.map((i) => i.productId) },
  };

  return (
    <Chart
      options={options}
      series={[{ data: interests.map((i) => i.count) }]}
      type="heatmap"
      height={350}
    />
  );
};

const TopProductsTable: FC<{
  products: Array<{
    productId: string;
    totalQuantity: number;
    productSlug: string;
  }>;
}> = ({ products }) => (
  <ChartCard title="Top Ordered Products">
    <div className="space-y-3">
      {products.map((product, index) => (
        <div
          key={product.productSlug}
          className="flex justify-between items-center bg-gray-700 p-3 rounded-lg"
        >
          <span className="text-gray-300">
            #{index + 1} {product.productId}
          </span>
          <span className="font-semibold">{product.totalQuantity} sold</span>
        </div>
      ))}
    </div>
  </ChartCard>
);

const RefundAnalysis: FC<{ refunds: DashboardData["refunds"] }> = ({
  refunds,
}) => (
  <ChartCard title="Refund Analysis">
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-gray-700 rounded-lg">
        <p className="text-2xl font-bold text-red-400">
          ${refunds.amount.toLocaleString()}
        </p>
        <p className="text-gray-400">Total Refunds</p>
      </div>
      <div className="text-center p-4 bg-gray-700 rounded-lg">
        <p
          className={`text-2xl font-bold ${refunds.trend >= 0 ? "text-green-400" : "text-red-400"}`}
        >
          {refunds.trend >= 0 ? "+" : ""}
          {refunds.trend}%
        </p>
        <p className="text-gray-400">Refund Trend</p>
      </div>
    </div>
  </ChartCard>
);

const ChartCard: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-gray-800 p-6 rounded-xl">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

// Keep existing components (MetricCard, GrowthBadge, EarningsChart, CategoryChart, RecentActivities) as they are
// ...
interface MetricCardProps {
  icon: JSX.Element;
  title: string;
  value: string | number;
  growth?: number;
  isCurrency?: boolean;
  isAlert?: boolean;
  trend?: number;
}
// Sub-components
const MetricCard: FC<MetricCardProps> = ({
  icon,
  title,
  value,
  growth,
  isCurrency,
  isAlert,
}) => (
  <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className={`text-2xl font-bold ${isAlert ? "text-yellow-400" : ""}`}>
          {isCurrency ? `$${value}` : value}
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

interface EarningsChartProps {
  data: { current: number; trend: number; daily: number };
}
const EarningsChart: FC<EarningsChartProps> = ({ data }) => {
  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      foreColor: "#fff",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: ["Current", "Last Week", "Today"],
    },
    yaxis: { labels: { formatter: (val: number) => `$${val.toFixed(2)}` } },
    colors: ["#4F46E5"],
    tooltip: { theme: "dark" },
  };

  const series = [
    {
      name: "Earnings",
      data: [data.current, data.trend, data.daily],
    },
  ];

  return <Chart options={options} series={series} type="line" height={350} />;
};
interface CategoryChartProps {
  distribution: Record<string, number>;
}
const CategoryChart: FC<CategoryChartProps> = ({ distribution }) => {
  const options: ApexOptions = {
    chart: {
      type: "pie",
      foreColor: "#fff",
    },
    labels: Object.keys(distribution),
    colors: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    legend: { position: "bottom" },
  };

  const series = Object.values(distribution);

  return <Chart options={options} series={series} type="pie" height={350} />;
};

interface RecentActivitiesProps {
  title: string;
  data: any[];
  icon: JSX.Element;
}
const RecentActivities: FC<RecentActivitiesProps> = ({ title, data, icon }) => (
  <div className="bg-gray-800 p-6 rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {icon}
    </div>
    <div className="space-y-4">
      {data.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No recent activities</p>
      ) : (
        data.map((activity, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
          >
            <div>
              <p className="font-medium">#{activity._id.slice(-4)}</p>
              <p className="text-sm text-gray-400">
                {new Date(activity.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${title.includes("Refund") ? "text-red-400" : "text-green-400"}`}
              >
                {title.includes("Refund") ? "-" : "+"}$
                {activity.amount?.toFixed(2) || activity.totalPrice?.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 capitalize">
                {activity.status}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default AdminDashboard;
