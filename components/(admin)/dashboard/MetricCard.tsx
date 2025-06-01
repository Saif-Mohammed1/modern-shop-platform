import { FiAlertCircle } from "react-icons/fi";

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  growth?: number;
  isCurrency?: boolean;
  isAlert?: boolean;
  unit?: string;
}

const MetricCard = ({
  icon,
  title,
  value,
  growth,
  isCurrency,
  isAlert,
  unit,
}: MetricCardProps) => {
  const formattedValue =
    typeof value === "number"
      ? isCurrency
        ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
        : value.toLocaleString()
      : value;

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-xl hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs md:text-sm mb-1">{title}</p>
          <p
            className={`text-xl md:text-2xl font-bold ${
              isAlert ? "text-yellow-400" : ""
            }`}
          >
            {formattedValue}
            {typeof unit === "string" && unit.trim() !== "" && (
              <span className="text-xs md:text-sm ml-1">{unit}</span>
            )}
          </p>
        </div>
        <div className="bg-gray-700/50 p-2 md:p-3 rounded-lg">{icon}</div>
      </div>
      {growth !== undefined && (
        <div className="mt-3 md:mt-4 flex items-center">
          <GrowthBadge value={growth} />
          <span className="text-xs md:text-sm ml-2 text-gray-400">
            from last week
          </span>
        </div>
      )}
    </div>
  );
};
function GrowthBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
        isPositive ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {isPositive ? "+" : ""}
      {value}%
      <FiAlertCircle className="ml-1 h-4 w-4" />
    </span>
  );
}
export default MetricCard;
