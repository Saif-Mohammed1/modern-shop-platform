"use client";
import { useState } from "react";

const Refunds = (Initial = []) => {
  const [refunds] = useState(Initial);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">My Refunds</h2>
      {refunds.length === 0 ? (
        <p>No refunds available.</p>
      ) : (
        <ul className="space-y-4">
          {refunds.map((refund) => (
            <li key={refund._id} className="p-4 bg-gray-100 rounded-lg">
              <p>
                <strong>Order ID:</strong> {refund.orderId}
              </p>
              <p>
                <strong>Reason:</strong> {refund.reason}
              </p>
              <p>
                <strong>Amount:</strong> ${refund.amount.toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong> {refund.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Refunds;
