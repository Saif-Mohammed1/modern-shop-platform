"use client";

import ErrorHandler from "@/components/Error/errorHandler";
import { FC, useEffect, useState } from "react";

type ErrorProps = {
  error: {
    message: string;
  };
  reset: () => void;
};

const Error: FC<ErrorProps> = ({ error, reset }) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (error.message) {
      setMessage(error.message);
    } else {
      setMessage(
        "An unexpected error occurred. Please try again later. Or contact support."
      );
    }
  }, [error]);

  return <ErrorHandler message={message} reset={reset} />;
};

export default Error;
