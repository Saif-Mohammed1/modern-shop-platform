"use client";
import { useState } from "react";

import api_client from "@/app/lib/utilities/api.client";
const AdminRefundReview = () => {
  const [refunds, setRefunds] = useState([]);

  const handleRefundDecision = async (refundId, decision) => {
    try {
      await api_client.patch(`/refunds/${refundId}`, { status: decision });

      setRefunds((prevRefunds) =>
        prevRefunds.map((refund) =>
          refund._id === refundId ? { ...refund, status: decision } : refund
        )
      );
    } catch (error) {
      /* eslint-disable no-console */
      console.error("Error updating refund status:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Refund Requests</h2>
      {refunds.length === 0 ? (
        <p>No refunds to review.</p>
      ) : (
        refunds.map((refund) => (
          <div
            key={refund._id}
            className="p-4 mb-4 border border-gray-300 rounded-lg shadow"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Refund for Invoice: {refund.invoice_id}
              </h3>
              <span
                className={`px-3 py-1 rounded ${
                  refund.status === "pending"
                    ? "bg-yellow-500 text-white"
                    : refund.status === "accepted"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                }`}
              >
                {refund.status}
              </span>
            </div>
            <p>
              <strong>Issue:</strong> {refund.issue}
            </p>
            <p>
              <strong>Reason:</strong> {refund.reason}
            </p>
            <p className="text-sm text-gray-500">
              Requested on: {new Date(refund.created_at).toLocaleDateString()}
            </p>

            {refund.status === "pending" && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleRefundDecision(refund._id, "accepted")}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRefundDecision(refund._id, "refused")}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Refuse
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminRefundReview;
