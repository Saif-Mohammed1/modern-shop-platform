"use client";
import React, { useEffect, useState } from "react";

const TestComponent = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 6000); // Simulate a 3-second delay

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return null; // Render nothing while loading
  }

  return <div>Content Loaded</div>;
};

export default TestComponent;
