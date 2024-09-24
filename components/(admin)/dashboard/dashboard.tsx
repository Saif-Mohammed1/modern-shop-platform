"use client";
import { Line } from "react-chartjs-2";
import {
  FaUsers,
  FaBox,
  FaMoneyBillWave,
  FaFileAlt,
  FaUndoAlt,
} from "react-icons/fa"; // Import Icons
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { FC } from "react";
import { dashboardTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/dashboardTranslate";
import { lang } from "@/components/util/lang";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
type DashboardProps = {
  data: {
    users: {
      count: number;
      growth: number;
    };
    orders: {
      count: number;
      earnings: number;
    };
    reports: {
      count: number;
      growth: number;
    };
    refunds: {
      count: number;
      loss: number;
    };
    products: {
      count: number;
      growth: number;
    };
  };
};

const Dashboard: FC<DashboardProps> = ({ data }) => {
  if (!data) {
    return <p>{dashboardTranslate.dashboard[lang]["empty-data"]}</p>;
  }

  const { users, orders, reports, refunds, products } = data;

  // Helper to calculate percentage growth
  const calcGrowth = (current: number, previous: number) => {
    return previous ? ((current - previous) / previous) * 100 : 0;
  };

  // Growth percentages
  const userGrowthPercent = calcGrowth(users.count, users.growth);
  const productGrowthPercent = calcGrowth(products.count, products.growth);

  // Chart Data
  const chartData: ChartData<"line"> = {
    labels: dashboardTranslate.dashboard[lang].chartData.labels.slice(), // [...dashboardTranslate.dashboard[lang].chartData.labels], //["Earnings", "Losses"],
    datasets: [
      {
        label: dashboardTranslate.dashboard[lang].chartData.datasets.label, //"Transactions",
        data: [orders.earnings, refunds.loss],
        backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 99, 132, 0.2)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-8 bg-gray-100 ">
      <h1 className="text-3xl font-bold mb-6">
        {dashboardTranslate.dashboard[lang].title}
      </h1>
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Users */}
          <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
            <FaUsers size={40} className="text-blue-500" />
            <div>
              <h2 className="text-xl font-bold">
                {dashboardTranslate.dashboard[lang].statistic.users.title}
              </h2>
              <p>
                {dashboardTranslate.dashboard[lang].statistic.users.total}:{" "}
                {users.count}
              </p>
              <p
                className={
                  userGrowthPercent > 0 ? "text-green-500" : "text-red-500"
                }
              >
                {dashboardTranslate.dashboard[lang].statistic.users.growth}:{" "}
                {userGrowthPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Orders */}
          <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
            <FaMoneyBillWave size={40} className="text-green-500" />
            <div>
              <h2 className="text-xl font-bold">
                {dashboardTranslate.dashboard[lang].statistic.orders.title}
              </h2>
              <p>
                {dashboardTranslate.dashboard[lang].statistic.orders.total}:{" "}
                {orders.count}
              </p>
              <p>
                {dashboardTranslate.dashboard[lang].statistic.orders.earnings}:
                ${orders.earnings}
              </p>
            </div>
          </div>

          {/* Products */}
          <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
            <FaBox size={40} className="text-orange-500" />
            <div>
              <h2 className="text-xl font-bold">
                {dashboardTranslate.dashboard[lang].statistic.products.title}
              </h2>
              <p>
                {dashboardTranslate.dashboard[lang].statistic.products.total}:{" "}
                {products.count}
              </p>
              <p
                className={
                  productGrowthPercent > 0 ? "text-green-500" : "text-red-500"
                }
              >
                {dashboardTranslate.dashboard[lang].statistic.products.growth}:{" "}
                {productGrowthPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Reports */}
          <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
            <FaFileAlt size={40} className="text-purple-500" />
            <div>
              <h2 className="text-xl font-bold">
                {dashboardTranslate.dashboard[lang].statistic.reports.title}
              </h2>
              <p>
                {dashboardTranslate.dashboard[lang].statistic.reports.total}:{" "}
                {reports.count}
              </p>
              <p>
                {dashboardTranslate.dashboard[lang].statistic.reports.growth}:{" "}
                {reports.growth}
              </p>
            </div>
          </div>

          {/* Refunds */}
          <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
            <FaUndoAlt size={40} className="text-red-500" />
            <div>
              <h2 className="text-xl font-bold">
                {dashboardTranslate.dashboard[lang].statistic.refunds.title}
              </h2>
              <p>
                {dashboardTranslate.dashboard[lang].statistic.refunds.total}:{" "}
                {refunds.count}
              </p>
              <p>
                {dashboardTranslate.dashboard[lang].statistic.refunds.loss}: $
                {refunds.loss}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md ">
          <h2 className="text-xl font-bold mb-4">Earnings vs Losses</h2>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
