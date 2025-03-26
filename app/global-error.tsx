"use client";

import ErrorHandler from "@/components/Error/errorHandler";
import { type FC, useEffect, useState } from "react";
import "./globals.css";

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
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main>
          <ErrorHandler message={message} reset={reset} />
        </main>
      </body>
    </html>
  );
};

export default Error;
