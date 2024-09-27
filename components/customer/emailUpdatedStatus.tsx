"use client";
import "./emailUpdatedStatus.css";
import { useEffect, useState } from "react";

import api from "@/components/util/axios.api";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { emailUpdatedStatusTranslate } from "@/app/_translate/emailUpdatedStatusTranslate";
import { lang } from "@/components/util/lang";

const ConfirmEmailChange = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  useEffect(() => {
    const handelConfirmEmailChange = async () => {
      const token = new URLSearchParams(searchParams).get("token");
      let toastLoading;
      if (!token) {
        setMessage(
          emailUpdatedStatusTranslate[lang].functions.useEffect
            .invalidOrMissingToken
        );
        setLoading(false);
        return;
      }

      try {
        toastLoading = toast.loading(
          emailUpdatedStatusTranslate[lang].functions.useEffect
            .confirmingRequest
        );
        const { data } = await api.put(
          `/customer/update-data/confirm-email-change?` + token
        );
        toast.success(data.message);
        setMessage(data.message);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : emailUpdatedStatusTranslate[lang].functions.errors.global;
        toast.error(errorMessage);
        setMessage(errorMessage);
      } finally {
        toast.dismiss(toastLoading);
        setLoading(false);
      }
    };

    handelConfirmEmailChange();
  }, [searchParams]);

  return (
    <div className="bg-gray-200 " id="container">
      {loading ? (
        <p className="loading">
          {emailUpdatedStatusTranslate[lang].functions.useEffect.loading}
        </p>
      ) : (
        <div className="messageBox">
          <h2 className="heading">
            {message.includes("successfully")
              ? emailUpdatedStatusTranslate[lang].functions.onSuccess
              : emailUpdatedStatusTranslate[lang].functions.onFail}
          </h2>
          <p className="message">{message}</p>
        </div>
      )}
    </div>
  );
};

export default ConfirmEmailChange;
