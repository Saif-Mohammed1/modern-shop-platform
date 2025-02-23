"use client";

import { useFormStatus } from "react-dom";

type SubmitProps = {
  className?: string;
  title?: string;
  disabled?: boolean;
};

const SubmitButton = ({
  className,
  title = "Submit",
  disabled,
}: SubmitProps) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={`flex items-center justify-center gap-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        className || ""
      }`}
    >
      {pending ? (
        <span className="animate-spin inline-block h-5 w-5 border-2 border-t-transparent border-white rounded-full"></span>
      ) : (
        title
      )}
    </button>
  );
};

export default SubmitButton;
