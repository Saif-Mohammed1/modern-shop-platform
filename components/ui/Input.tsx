import { FiSearch, FiCalendar } from "react-icons/fi";

type InputProps = {
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
};

const Input = ({ icon, className = "", ...props }: InputProps) => (
  <div className={`relative ${className}`}>
    {icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
    )}
    <input
      {...props}
      className={`block w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
    />
  </div>
);

export default Input;
