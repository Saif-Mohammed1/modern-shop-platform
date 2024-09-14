"use client";
import { useEffect, useState } from "react";

import api from "../util/axios.api";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const ConfirmEmailChange = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  useEffect(() => {
    const handelConfirmEmailChange = async () => {
      const token = new URLSearchParams(searchParams).get("token");
      let toastLoading;
      if (!token) {
        setMessage("Invalid or missing token.");
        setLoading(false);
        return;
      }

      try {
        toastLoading = toast.loading("confirming your request");
        const { data } = await api.put(
          `/customer/update-data/confirm-email-change?` + token
        );
        toast.success(data.message);
        setMessage(response.data.message);
      } catch (error) {
        toast.dismiss(toastLoading);
        toast.error(
          error?.message ||
            error ||
            "An error occurred while confirming your email."
        );
        setMessage(
          error?.message ||
            error ||
            "An error occurred while confirming your email."
        );
      } finally {
        setLoading(false);
      }
    };

    handelConfirmEmailChange();
  }, [searchParams]);

  return (
    <div style={styles.container} className="bg-gray-200">
      {loading ? (
        <p style={styles.loading}>Processing your request...</p>
      ) : (
        <div style={styles.messageBox}>
          <h2 style={styles.heading}>
            {message.includes("successfully") ? "Success" : "Error"}
          </h2>
          <p style={styles.message}>{message}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  loading: {
    fontSize: "18px",
    color: "#555",
  },
  messageBox: {
    maxWidth: "500px",
    padding: "20px",
    border: "1px solid #fff",
    borderRadius: "10px",
    textAlign: "center",
  },
  heading: {
    fontSize: "24px",
    color: "#333",
  },
  message: {
    fontSize: "18px",
    color: "#555",
  },
};

export default ConfirmEmailChange;
