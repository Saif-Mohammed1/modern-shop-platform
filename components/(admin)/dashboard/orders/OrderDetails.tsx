"use client";

import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

import { OrderStatus, type OrderType } from "@/app/lib/types/orders.db.types";
import { formatCurrency } from "@/app/lib/utilities/formatCurrency";
import { lang } from "@/app/lib/utilities/lang";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import { ordersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/ordersTranslate";

interface AdminOrderDetailsProps {
  order: OrderType;
}
const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: String!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      _id
      status
    }
  }
`;

interface UpdateMutationResponse {
  updateOrderStatus: {
    _id: string;
    status: OrderStatus;
  };
}
const AdminOrderDetails = ({ order }: AdminOrderDetailsProps) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [updateOrderStatus, { loading }] = useMutation<UpdateMutationResponse>(
    UPDATE_ORDER_STATUS,
    {
      onCompleted: (data) => {
        const updatedOrder = data.updateOrderStatus;
        setStatus(updatedOrder.status as OrderStatus);
        toast.success(
          ordersTranslate.functions[lang].handleStatusUpdate.success
        );
      },
      onError: (error) => {
        toast.error(
          (error as Error)?.message || ordersTranslate.functions[lang].error
        );
      },
    }
  );

  const router = useRouter();

  const handleStatusUpdate = async () => {
    await updateOrderStatus({
      variables: { id: order._id, status },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.invoice_id}</h1>
          <StatusBadge status={order.status as OrderStatus} />
        </div>
        <Button
          onClick={() => {
            router.push("/dashboard/orders");
          }}
        >
          Back to Orders
        </Button>
      </div>

      <Card>
        <CardHeader className="text-lg font-semibold">
          Shipping Information
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Contact</p>
            <p>{order.shipping_address.phone}</p>
          </div>
          <div>
            <p className="font-medium">Address</p>
            <p>
              {order.shipping_address.street}, {order.shipping_address.city}
              <br />
              {order.shipping_address.state}{" "}
              {order.shipping_address.postal_code}
              <br />
              {order.shipping_address.country}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-lg font-semibold">Order Items</CardHeader>
        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                {/* {item.attributes && Object.keys(item.attributes).length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Attributes: {JSON.stringify(item.attributes)}
                  </p>
                )} */}
                {/* {item.attributes
                  ? Object.entries(item.attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-gray-600 capitalize">{key}</dt>
                        <dd className="text-gray-900 font-medium">{value}</dd>
                      </div>
                    ))
                  : null} */}
              </div>
              <div className="text-right">
                <p>
                  {item.quantity} ×{" "}
                  {formatCurrency(item.final_price, {
                    currency: order.currency,
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.quantity * item.final_price, {
                    currency: order.currency,
                  })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-lg font-semibold">
          Financial Details
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              {formatCurrency(order.subtotal, { currency: order.currency })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>
              {formatCurrency(order.tax, { currency: order.currency })}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>
              {formatCurrency(order.total, { currency: order.currency })}
            </span>
          </div>
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              Invoice ID: {order.invoice_id}
            </p>
            {order.invoice_link ? (
              <a
                href={order.invoice_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View Invoice
              </a>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-lg font-semibold">Order Status</CardHeader>
        <CardContent className="flex items-center gap-4">
          <Select
            options={Object.values(OrderStatus).map((status) => ({
              label: ordersTranslate.orders[lang].filter.select.options[status],
              value: status,
            }))}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as OrderStatus);
            }}
            placeholder="Select Status"
          />
          <Button
            onClick={handleStatusUpdate}
            disabled={loading || status === order.status}
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </CardContent>
      </Card>

      {order.order_notes && order.order_notes.length > 0 ? (
        <Card>
          <CardHeader className="text-lg font-semibold">Order Notes</CardHeader>
          <CardContent className="space-y-2">
            {order.order_notes.map((note, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                {note}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
export default AdminOrderDetails;
