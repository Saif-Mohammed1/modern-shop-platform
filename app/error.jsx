"use client";

import ErrorHandler from "@/components/Error/errorHandler";
import { useEffect, useState } from "react";

export default function Error({ error, reset }) {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (error.message) {
      setMessage(error.message);
    } else {
      setMessage(
        "An unexpected error occurred. Please try again later.Or contact support."
      );
    }
  }, [error]);
  return <ErrorHandler message={message} reset={reset} />;
}
