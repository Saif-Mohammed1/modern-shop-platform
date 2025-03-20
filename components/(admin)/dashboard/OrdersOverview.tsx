// components/OrdersOverview.tsx
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function OrdersOverview({ data }: { data: any }) {
  const weeklyGrowth = data.weeklyGrowth;
  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: "line" },
    xaxis: { categories: weeklyGrowth.map((w: any) => w.label) },
    yaxis: { title: { text: "Orders" } },
  };

  const chartSeries = [
    {
      name: "Orders",
      data: weeklyGrowth.map((w: any) => w.currentOrders),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
      <h2 className="text-xl font-semibold mb-6">Orders Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={350}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Top Products</h3>
          <div className="space-y-4">
            {data.topProducts.map((product: any) => (
              <div
                key={product.productId}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="truncate">{product.name}</span>
                <span className="font-medium">
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
