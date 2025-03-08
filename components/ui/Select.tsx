import { Event } from "@/app/lib/types/products.types";

type SelectProps = {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (e: Event) => void;

  // onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  customStyle?: string;
  icon?: React.ReactNode;
  isMobile?: boolean;
  id?: string;
  label?: string;
};

const Select = ({
  options,
  value,
  onChange,
  placeholder,
  className = "",
  customStyle = "",
  icon,
  isMobile = false,
  id,
  label,
}: SelectProps) => (
  <div
    className={`flex ${isMobile ? "flex-col" : "items-center gap-2"} w-full`}
  >
    {id && (
      <label
        htmlFor={id}
        className={`${isMobile ? "mb-2" : ""} text-gray-700 font-medium`}
      >
        {label}
      </label>
    )}
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${className} ${customStyle}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-base relative"
        >
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default Select;
