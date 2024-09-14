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
} from "chart.js";

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

const DashboardV3 = ({ data }) => {
  if (!data) {
    return <p>No data available.</p>;
  }

  const { users, orders, reports, refunds, products } = data;

  // Helper to calculate percentage growth
  const calcGrowth = (current, previous) => {
    return previous ? ((current - previous) / previous) * 100 : 0;
  };

  // Growth percentages
  const userGrowthPercent = calcGrowth(users.count, users.growth);
  const productGrowthPercent = calcGrowth(products.count, products.growth);

  // Chart Data
  const chartData = {
    labels: ["Earnings", "Losses"],
    datasets: [
      {
        label: "Transactions",
        data: [orders.earnings, refunds.loss],
        backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 99, 132, 0.2)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-8 bg-gray-100 ">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Users */}
          <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
            <FaUsers size={40} className="text-blue-500" />
            <div>
              <h2 className="text-xl font-bold">Users</h2>
              <p>Total: {users.count}</p>
              <p
                className={
                  userGrowthPercent > 0 ? "text-green-500" : "text-red-500"
                }
              >
                Growth: {userGrowthPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Orders */}
          <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
            <FaMoneyBillWave size={40} className="text-green-500" />
            <div>
              <h2 className="text-xl font-bold">Orders</h2>
              <p>Total Orders: {orders.count}</p>
              <p>Total Earnings: ${orders.earnings}</p>
            </div>
          </div>

          {/* Products */}
          <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
            <FaBox size={40} className="text-orange-500" />
            <div>
              <h2 className="text-xl font-bold">Products</h2>
              <p>Total: {products.count}</p>
              <p
                className={
                  productGrowthPercent > 0 ? "text-green-500" : "text-red-500"
                }
              >
                Growth: {productGrowthPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Reports */}
          <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
            <FaFileAlt size={40} className="text-purple-500" />
            <div>
              <h2 className="text-xl font-bold">Reports</h2>
              <p>Total: {reports.count}</p>
              <p>Growth: {reports.growth}</p>
            </div>
          </div>

          {/* Refunds */}
          <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
            <FaUndoAlt size={40} className="text-red-500" />
            <div>
              <h2 className="text-xl font-bold">Refunds</h2>
              <p>Total Refunds: {refunds.count}</p>
              <p>Total Losses: ${refunds.loss}</p>
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

export default DashboardV3;
