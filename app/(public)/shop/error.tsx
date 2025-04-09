'use client';

import {type FC, useEffect, useState} from 'react';

import ErrorHandler from '@/components/Error/errorHandler';

type ErrorProps = {
  error: {
    message: string;
  };
  reset: () => void;
};

const Error: FC<ErrorProps> = ({error, reset}) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (error.message) {
      setMessage(error.message);
    }
  }, [error]);

  return <ErrorHandler message={message} reset={reset} />;
};

export default Error;
