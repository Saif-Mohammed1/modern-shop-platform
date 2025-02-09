"use client";
import React, { FC, useState } from "react";
import toast from "react-hot-toast";
import api from "@/components/util/api";
import { ordersTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/ordersTranslate";
import { lang } from "@/components/util/lang";
import { OrderStatus, OrderType } from "@/app/types/orders.types";
import { useRouter } from "next/navigation";

type Props = {
  order: OrderType;
};

const AdminOrderDetails: FC<Props> = ({ order }) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const router = useRouter();
  const handleStatusChange = async () => {
    let toastLoading;
    try {
      toastLoading = toast.loading(
        ordersTranslate.functions[lang].handleStatusUpdate.loading
      );

      await api.put(`/admin/dashboard/orders/${order._id}`, { status });
      setStatus(status);
      toast.success(ordersTranslate.functions[lang].handleStatusUpdate.success);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || ordersTranslate.functions[lang].error);
      } else {
        toast.error(ordersTranslate.functions[lang].error);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
  };
  const goBack = () => {
    router.push("/dashboard/orders");
  };

  return (
    <div className="p-6 max-w-4xl #mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold mb-4">
          {ordersTranslate.orders[lang].details.title}
        </h2>
        <button
          onClick={goBack}
          className="p-2 bg-blue-500 text-white rounded-md"
        >
          {ordersTranslate.orders[lang].details.goBack}
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl mb-4">
          {ordersTranslate.orders[lang].details.shippingInfo.title}
        </h3>
        <p>
          {ordersTranslate.orders[lang].details.shippingInfo.street}:
          {order.shippingInfo.street}
        </p>
        <p>
          {ordersTranslate.orders[lang].details.shippingInfo.city}:{" "}
          {order.shippingInfo.city}
        </p>
        <p>
          {ordersTranslate.orders[lang].details.shippingInfo.state}:{" "}
          {order.shippingInfo.state}
        </p>
        <p>
          {ordersTranslate.orders[lang].details.shippingInfo.postalCode}:{" "}
          {order.shippingInfo.postalCode}
        </p>
        <p>
          {ordersTranslate.orders[lang].details.shippingInfo.phone}:{" "}
          {order.shippingInfo.phone}
        </p>
        <p>
          {ordersTranslate.orders[lang].details.shippingInfo.country}:{" "}
          {order.shippingInfo.country}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
        <h3 className="text-xl mb-4">
          {ordersTranslate.orders[lang].details.items.title}
        </h3>
        <div className="max-h-[50vh] overscroll-y-auto ">
          {order.items.map((item, index) => (
            <div key={index}>
              <p>{item.name}</p>
              <p>
                {ordersTranslate.orders[lang].details.items.quantity}:{" "}
                {item.quantity}
              </p>
              <p>
                {ordersTranslate.orders[lang].details.items.price}: $
                {item.price}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
        <h3 className="text-xl mb-4">
          {ordersTranslate.orders[lang].details.status}
        </h3>
        <select
          value={status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setStatus(e.target.value as OrderStatus)
          }
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="pending">
            {ordersTranslate.orders[lang].filter.select.options.pending}
          </option>
          <option value="completed">
            {ordersTranslate.orders[lang].filter.select.options.completed}
          </option>
          <option value="refunded">
            {ordersTranslate.orders[lang].filter.select.options.refunded}
          </option>
          <option value="processing">
            {ordersTranslate.orders[lang].filter.select.options.processing}
          </option>
          <option value="cancelled">
            {ordersTranslate.orders[lang].filter.select.options.cancelled}
          </option>
        </select>
        <button
          onClick={handleStatusChange}
          className="ml-4 p-2 bg-blue-500 text-white rounded-md"
        >
          {ordersTranslate.orders[lang].details.submit}{" "}
        </button>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
