"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/components/util/axios.api";
const AdminOrderDetails = ({ order }) => {
  const [status, setStatus] = useState(order.status);

  const handleStatusChange = async () => {
    let toastLoading;
    try {
      toastLoading = toast.loading("updating status...");

      await api.put(`/admin/dashboard/orders/${order._id}`, { status });
      setStatus(status);
      toast.success("status updated");
    } catch (error) {
      toast.error(error?.message || "something went wrong");
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold mb-4">Order Details</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl mb-4">Shipping Info</h3>
        <p>Street: {order.shippingInfo.street}</p>
        <p>City: {order.shippingInfo.city}</p>
        <p>State: {order.shippingInfo.state}</p>
        <p>Postal Code: {order.shippingInfo.postalCode}</p>
        <p>Phone: {order.shippingInfo.phone}</p>
        <p>Country: {order.shippingInfo.country}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
        <h3 className="text-xl mb-4">Items</h3>
        <div className="max-h-[50vh] overscroll-y-auto ">
          {order.items.map((item, index) => (
            <div key={index}>
              <p>{item.name}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
        <h3 className="text-xl mb-4">Order Status</h3>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="refunded">Refunded</option>
          <option value="processing">Processing</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={handleStatusChange}
          className="ml-4 p-2 bg-blue-500 text-white rounded-md"
        >
          Update Status
        </button>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
