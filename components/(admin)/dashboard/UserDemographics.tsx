// components/UserDemographics.tsx
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

import type { DashboardDataApi } from "@/app/lib/types/dashboard.types";

export function UserDemographics({
  data,
}: {
  data: DashboardDataApi["users"];
}) {
  const deviceOptions: ApexOptions = {
    chart: { type: "donut" },
    labels: data.geographicalInsights.deviceDistribution.map((d) => d.device),
    legend: { position: "bottom" },
  };

  const deviceSeries = data.geographicalInsights.deviceDistribution.map(
    (d) => d.count
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
      <h2 className="text-xl font-semibold mb-6">User Demographics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Device Distribution</h3>
          <Chart
            options={deviceOptions}
            series={deviceSeries}
            type="donut"
            height={350}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Top Locations</h3>
          <div className="space-y-4">
            {data.geographicalInsights.topLocations.map((location) => (
              <div
                key={location.city}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span>
                  {location.city}, {location.country}
                </span>
                <span className="font-medium">{location.logins} logins</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
