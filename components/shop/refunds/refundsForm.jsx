"use client";
import { useState } from "react";
import toast from "react-hot-toast";

const RefundRequest = ({ orderId, totalAmount }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRefundRequest = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please provide a reason for the refund.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          reason,
          amount: totalAmount,
        }),
      });

      if (res.ok) {
        toast.success("Refund request submitted.");
      } else {
        throw new Error("Failed to submit refund.");
      }
    } catch (error) {
      toast.error("Error submitting refund request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submitRefundRequest}
      className="p-4 bg-white rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4">Request a Refund</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="reason">
          Reason for Refund:
        </label>
        <textarea
          id="reason"
          className="w-full p-2 border rounded-lg"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows="4"
          required
        ></textarea>
      </div>
      <button
        type="submit"
        className={`bg-blue-600 text-white font-bold py-2 px-4 rounded ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Refund Request"}
      </button>
    </form>
  );
};

export default RefundRequest;
