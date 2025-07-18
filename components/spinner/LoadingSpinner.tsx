interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  variant?: "default" | "dots" | "pulse" | "bars";
}

const LoadingSpinner = ({
  size = "lg",
  text,
  variant = "default",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        );

      case "pulse":
        return (
          <div
            className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse`}
          ></div>
        );

      case "bars":
        return (
          <div className="flex space-x-1">
            <div
              className="w-2 h-8 bg-blue-500 rounded animate-pulse"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-2 h-8 bg-blue-500 rounded animate-pulse"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-8 bg-blue-500 rounded animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-8 bg-blue-500 rounded animate-pulse"
              style={{ animationDelay: "0.3s" }}
            ></div>
          </div>
        );

      default:
        return (
          <div className="relative">
            <div
              className={`${sizeClasses[size]} border-4 border-gray-300 border-t-4 border-t-blue-500 rounded-full animate-spin`}
            ></div>
            {/* Optional pulsing dot in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-3">
      {renderSpinner()}
      {text ? (
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {text}
        </p>
      ) : null}
    </div>
  );
};

export default LoadingSpinner;
