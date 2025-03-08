// type InputProps = {
//   label?: React.ReactNode;
//   icon?: React.ReactNode;
//   value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   placeholder?: string;
//   type?: string;
//   className?: string;
//   name?: string;
//   required?: boolean;
//   disabled?: boolean;
//   autoComplete?: string;
// };

// const Input = ({ label, icon, className = "", name, ...props }: InputProps) => (
//   <div className={className}>
//     {label && (
//       <label
//         htmlFor={name}
//         className="block text-sm font-medium text-gray-700 mb-1"
//       >
//         {label}
//       </label>
//     )}
//     <div className="relative">
//       {icon && (
//         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//           {icon}
//         </div>
//       )}
//       <input
//         {...props}
//         id={name}
//         name={name}
//         className={`block w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//       />
//     </div>
//   </div>
// );

// export default Input;

type InputProps = {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  // value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // placeholder?: string;
  // type?: string;
  // className?: string;
  // name?: string;
  // required?: boolean;
  // disabled?: boolean;
  // autoComplete?: string;
  error?: string | string[]; // Add error prop
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = ({
  label,
  icon,
  className = "",
  name,
  error,
  ...props
}: InputProps) => {
  const errorMessages = Array.isArray(error) ? error : [error];

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          {...props}
          id={name}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`block w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-500" : "focus:ring-indigo-500"
          } ${error ? "focus:border-red-500" : "focus:border-indigo-500"}`}
        />
      </div>
      {error && (
        <div id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {errorMessages.filter(Boolean).map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
      )}
    </div>
  );
};
export default Input;
