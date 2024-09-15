"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Lottie from "lottie-react";
import notFoundAnimation from "/public/animations/notFound.json"; // You need a Lottie animation JSON file
import Link from "next/link";

const NotFoundComponent = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {/* Animated Illustration */}
      <div className="max-w-md w-full mb-8">
        <Lottie
          animationData={notFoundAnimation}
          loop={true}
          className="w-full h-full"
        />
      </div>

      {/* 404 Error Text */}
      <h1 className="text-4xl text-center font-bold text-gray-800 mb-4 animate-bounce">
        404 - Page Not Found
      </h1>

      {/* Suggestions */}
      <p className="text-lg text-center  text-gray-600 mb-8">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      {/* Links */}
      <div className="flex  gap-6">
        <Link href="/">
          <span className="text-blue-500 hover:underline">Go to Homepage</span>
        </Link>
        <Link href="/contact-us">
          <span className="text-blue-500 hover:underline">Contact Us</span>
        </Link>
      </div>

      {/* Go Back Button */}
      <button
        onClick={() => router.back()}
        className="mt-8 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFoundComponent;
