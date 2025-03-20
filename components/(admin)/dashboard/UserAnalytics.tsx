// components/UserAnalytics.tsx
import dynamic from "next/dynamic";
import { useDashboard } from "@/contexts/DashboardContext";
import { UserData } from "@/types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface UserAnalyticsProps {
  data: UserData;
}

export default function UserAnalytics({ data }: UserAnalyticsProps) {
  const { viewMode } = useDashboard();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6">User Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic View */}
        {viewMode === "basic" && (
          <>
            <MetricCard
              title="Total Users"
              value={data.totalUsers}
              trend={data.weeklyGrowth[0]?.growthPercentage}
            />
            <MetricCard title="Active Users" value={data.activeUsers} />
            <SecurityOverview data={data.security} />
          </>
        )}

        {/* Advanced View */}
        {viewMode === "advanced" && (
          <>
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-4">
                Geographical Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.geographicalInsights.topLocations.map((location) => (
                  <LocationCard key={location.city} location={location} />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <DeviceDistribution
                data={data.geographicalInsights.deviceDistribution}
              />
              <LanguageDistribution data={data.languageDistribution} />
            </div>
          </>
        )}
      </div>

      {viewMode === "advanced" && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Security Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SecurityDetail
              title="Two-Factor Adoption"
              value={`${data.security.twoFactorAdoption}%`}
            />
            <SecurityDetail
              title="High Risk Users"
              value={data.security.highRiskUsers}
            />
            <SecurityDetail
              title="Bot Attempts"
              value={data.security.threats.botAttempts}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const SecurityDetail = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h4 className="text-sm text-gray-500 mb-1">{title}</h4>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);
