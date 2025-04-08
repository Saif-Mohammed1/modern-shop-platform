"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "@/app/lib/utilities/api";
import { deleteCookies } from "@/app/lib/utilities/cookies";
import { sessionExpiredOverlayTranslate } from "@/public/locales/client/(public)/sessionExpiredOverlayTranslate";

import { lang } from "../../app/lib/utilities/lang";

const SessionExpiredOverlay = () => {
  const router = useRouter();
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    // Listen for the 'sessionExpired' event globally
    const handleSessionExpired = () => {
      setIsSessionExpired(true);
    };

    window.addEventListener("sessionExpired", handleSessionExpired);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signOut();
      await deleteCookies("refreshAccessToken");

      await api.post("/auth/logout");
      // Handle login logic here
      router.push("/auth");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to logout";
      toast.error(errorMessage);
    }
  };

  if (!isSessionExpired) {
    return null; // Don't render anything unless the session is expired
  }

  return (
    <div className="fixed -top-[2dvh] left-0 w-screen h-screen flex items-center justify-center bg-gray-900 bg-opacity-75 z-[9999999999]">
      <div className="bg-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          {sessionExpiredOverlayTranslate[lang].sessionExpired.title}
        </h2>
        <p className="text-gray-600 mb-8">
          {sessionExpiredOverlayTranslate[lang].sessionExpired.message}
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleLogin}
        >
          {sessionExpiredOverlayTranslate[lang].sessionExpired.login}
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredOverlay;
