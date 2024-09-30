// pages/429.tsx
import { NextPage } from "next";
import Link from "next/link";
// import Lottie from "lottie-react";
// import tooManyRequestsAnimation from "../public/animations/too-many-requests.json"; // Ensure to place your Lottie file in the public folder

const TooManyRequests: NextPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-10 rounded-lg shadow-lg">
        {/* Lottie Animation */}
        {/* <div className="w-60 h-60 mx-auto mb-6">
          <Lottie animationData={tooManyRequestsAnimation} loop={true} />
        </div> */}
        <h1 className="text-4xl font-bold text-red-600 mb-4">429</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Too Many Requests
        </h2>
        <p className="text-gray-500 mb-8">
          You have sent too many requests in a short amount of time.
          <br />
          Please try again later.
        </p>

        {/* Action button */}
        {/* <Link href="/">
          <span className="mt-6 inline-block px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-300">
            Go back to Homepage
          </span>
        </Link> */}
      </div>
    </div>
  );
};

export default TooManyRequests;
