"use client";

import { useState } from "react";

import api from "@/app/lib/utilities/api";

const UserRefundRequest = ({ userId, initialRefunds = [] }) => {
  const [refunds, setRefunds] = useState(initialRefunds);
  const [issue, setIssue] = useState("");
  const [reason, setReason] = useState("");
  const [invoiceId, setInvoiceId] = useState("");

  const handleRefundSubmit = () => {
    api
      .post("/refunds", { issue, reason, invoiceId, user: userId })
      .then((response) => {
        setRefunds([...refunds, response.data]);
        setIssue("");
        setReason("");
        setInvoiceId("");
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Request a Refund</h2>
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium">Invoice ID</label>
        <input
          type="text"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter your invoice ID"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium">Issue</label>
        <input
          type="text"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="What is the issue?"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Provide a detailed reason"
        ></textarea>
      </div>
      <button
        onClick={handleRefundSubmit}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Submit Refund Request
      </button>

      <h2 className="text-2xl font-bold mt-10 mb-6">Your Refund Requests</h2>
      {refunds.length === 0 ? (
        <p>No refund requests made yet.</p>
      ) : (
        refunds.map((refund) => (
          <div
            key={refund._id}
            className="p-4 mb-4 border border-gray-300 rounded-lg shadow"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Refund for Invoice: {refund.invoiceId}
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
              Requested on:{" "}
              {new Date(refund.createdAt).toLocaleDateString("en-US")}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default UserRefundRequest;
