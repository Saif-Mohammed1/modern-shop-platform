import { ReactNode } from "react";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  danger?: boolean;
  children?: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  variant = "primary",
  size = "md",
  icon,
  danger = false,
  children,
  ...props
}: ButtonProps) => {
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variants = {
    primary: `text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}`,
    secondary: `border ${danger ? "border-red-600 text-red-600 hover:bg-red-50" : "border-indigo-600 text-indigo-600 hover:bg-indigo-50"}`,
    ghost: `hover:bg-gray-100 ${danger ? "text-red-600" : "text-gray-700"}`,
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-md font-medium transition-colors ${sizes[size]} ${variants[variant]} ${props.className || ""}`}
    >
      {icon}
      {children}
    </button>
  );
};

export default Button;
