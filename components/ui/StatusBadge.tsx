import { lang } from "@/app/lib/utilities/lang";
import {
  ordersTranslate,
  StatusColors,
} from "@/public/locales/client/(auth)/(admin)/dashboard/ordersTranslate";

type StatusBadgeProps = {
  status: keyof typeof StatusColors;
};

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      StatusColors[status] || "bg-gray-100 text-gray-800"
    }`}
  >
    {ordersTranslate.orders[lang].filter.select.options[status]}
  </span>
);
// const StatusBadge = ({ status, children }: StatusBadgeProps) => (
//   <span
//     className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//       StatusColors[status] || "bg-gray-100 text-gray-800"
//     }`}
//   >
//     {children}
//   </span>
// );

export default StatusBadge;
