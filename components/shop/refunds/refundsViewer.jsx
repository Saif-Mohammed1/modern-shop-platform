"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Refunds = () => {
  const [refunds, setRefunds] = useState([
    {
      _id: "1",
      orderId: "12345",
      amount: 100.0,
      status: "Processed",
      date: "2023-10-01",
    },
    {
      _id: "2",
      orderId: "67890",
      amount: 50.0,
      status: "Pending",
      date: "2023-10-02",
    },
    {
      _id: "3",
      orderId: "54321",
      amount: 75.0,
      status: "Failed",
      date: "2023-10-03",
    },
  ]);

  //   useEffect(() => {
  //     const fetchRefunds = async () => {
  //       try {
  //         const res = await fetch("/api/refunds");
  //         const data = await res.json();
  //         setRefunds(data);
  //       } catch (error) {
  //         toast.error("Failed to load refunds.");
  //       }
  //     };
  //     fetchRefunds();
  //   }, []);

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
