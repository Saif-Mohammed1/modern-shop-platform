// components/MetricCard.tsx
import {MotionDiv} from './MotionDiv';

export function MetricCard({
  title,
  value,
  trend,
}: {
  title: string;
  value: string | number;
  trend?: number;
}) {
  return (
    <MotionDiv
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <div className="mt-4 flex items-baseline">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {trend ? <span className={`ml-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}
            {trend}%
          </span> : null}
      </div>
    </MotionDiv>
  );
}
