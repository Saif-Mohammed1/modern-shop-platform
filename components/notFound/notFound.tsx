"use client";

// import Lottie from "lottie-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { lang } from "@/app/lib/utilities/lang";
import { rootStaticPagesTranslate } from "@/public/locales/client/(public)/rootStaticPagesTranslate";

// import notFoundAnimation from "/public/animations/notFound.json";

const NotFoundComponent = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {/* Animated Illustration */}
      <div className="max-w-md w-full mb-8">
        {/* <Lottie
          animationData={notFoundAnimation}
          loop={true}
          className="w-full h-full"
        /> */}
      </div>

      {/* 404 Error Text */}
      <h1 className="text-4xl text-center font-bold text-gray-800 mb-4 animate-bounce">
        {rootStaticPagesTranslate[lang].notFound.title}
      </h1>

      {/* Suggestions */}
      <p className="text-lg text-center  text-gray-600 mb-8">
        {rootStaticPagesTranslate[lang].notFound.suggestions}
      </p>

      {/* Links */}
      <div className="flex  gap-6">
        <Link href="/">
          <span className="text-blue-500 hover:underline">
            {rootStaticPagesTranslate[lang].notFound.links.home}
          </span>
        </Link>
        <Link href="/contact-us">
          <span className="text-blue-500 hover:underline">
            {rootStaticPagesTranslate[lang].notFound.links.contact}
          </span>
        </Link>
      </div>

      {/* Go Back Button */}
      <button
        onClick={() => {
          router.back();
        }}
        className="mt-8 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
      >
        {rootStaticPagesTranslate[lang].notFound.button.goBack}
      </button>
    </div>
  );
};

export default NotFoundComponent;
