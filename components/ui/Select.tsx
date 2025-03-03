type SelectProps = {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  customStyle?: string;
  icon?: React.ReactNode;
};

const Select = ({
  options,
  value,
  onChange,
  placeholder,
  className = "",
  customStyle = "",
  icon,
}: SelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
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
);

export default Select;
