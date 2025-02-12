import { StatusColors } from "@/app/_translate/(auth)/(admin)/dashboard/ordersTranslate";

type StatusBadgeProps = {
  status: keyof typeof StatusColors;
  children: React.ReactNode;
};

const StatusBadge = ({ status, children }: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      StatusColors[status] || "bg-gray-100 text-gray-800"
    }`}
  >
    {children}
  </span>
);

export default StatusBadge;
