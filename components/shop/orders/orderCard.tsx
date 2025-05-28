import Link from "next/link";

import type { OrderStatus, OrderType } from "@/app/lib/types/orders.db.types";
import { formatCurrency } from "@/app/lib/utilities/formatCurrency";
import { lang } from "@/app/lib/utilities/lang";
import { accountOrdersTranslate } from "@/public/locales/client/(auth)/account/ordersTranslate";
// Sub-components

const ShippingInfo = ({
  shipping_address,
  t,
}: {
  shipping_address: OrderType["shipping_address"];
  t: (typeof accountOrdersTranslate)[typeof lang]["orderTracking"]["shipping_info"];
}) => (
  <div>
    <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
    <address className="not-italic">
      <p>{shipping_address.street}</p>
      <p>
        {shipping_address.city}, {shipping_address.state}
      </p>
      <p>{shipping_address.postal_code}</p>
      <p>{shipping_address.country}</p>
      <p className="mt-2">
        {t.phone}: {shipping_address.phone}
      </p>
    </address>
  </div>
);
const ItemDetail = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <p>
    <span className="font-bold">{label}:</span> {value}
  </p>
);
const OrderItem = ({
  item,
  t,
}: {
  item: OrderType["items"][number];
  t: (typeof accountOrdersTranslate)[typeof lang]["orderTracking"]["items"];
}) => (
  <li className="border-b pb-4 mb-4 last:border-b-0 last:mb-0">
    <ItemDetail label={t.name} value={item.name} />
    <ItemDetail label={t.quantity} value={item.quantity} />
    <ItemDetail label={t.price} value={formatCurrency(item.price)} />
    <ItemDetail
      label={t.discount}
      value={
        item.discount > 0 ? formatCurrency(item.discount) : t.existDiscount
      }
    />
    <ItemDetail
      label={t.final_price}
      value={formatCurrency(item.final_price)}
    />
  </li>
);

const ItemsList = ({
  items,
  t,
}: {
  items: OrderType["items"];
  t: (typeof accountOrdersTranslate)[typeof lang]["orderTracking"]["items"];
}) => (
  <div>
    <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
    <ul className="space-y-4 max-h-96 overflow-y-auto">
      {items.map((item) => (
        <OrderItem key={item.product_id.toString()} item={item} t={t} />
      ))}
    </ul>
  </div>
);
// Sub-components
const OrderSummary = ({
  order,
  t,
}: {
  order: OrderType;
  t: (typeof accountOrdersTranslate)[typeof lang]["orderCompleted"]["summery"];
}) => (
  <div className="border-t border-gray-200 pt-4">
    <p className="text-lg mb-4">
      {t.subtotal}:{" "}
      <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
    </p>

    <p className="text-lg mb-4 border-b border-gray-200 pb-4">
      {t.tax}:{" "}
      <span className="font-semibold">{formatCurrency(order.tax)}</span>
    </p>
    <p className="text-lg mb-4 border-b border-gray-200 pb-4">
      {t.totalAmount}:{" "}
      <span className="font-semibold">{formatCurrency(order.total)}</span>
    </p>
  </div>
);

const OrderStatusSection = ({
  status,
  order,
  t,
}: {
  status: OrderStatus;
  order: OrderType;
  t: (typeof accountOrdersTranslate)[typeof lang]["orderTracking"]["orderStatus"];
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
    <div className="w-full sm:w-1/2">
      <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
      <span className="capitalize block">{status}</span>
    </div>
    {/* <div className="w-full sm:w-1/2">
      <h3 className="text-xl font-semibold mb-2">{t.totalPrice}</h3>
      <span className="block">{formatCurrency(totalPrice)}</span>
    </div> */}
    <OrderSummary
      order={order}
      t={accountOrdersTranslate[lang]["orderCompleted"]["summery"]}
    />
  </div>
);

const InvoiceSection = ({
  invoice_link,
  t,
}: {
  invoice_link: string;
  t: (typeof accountOrdersTranslate)[typeof lang]["orderTracking"]["invoice"];
}) => (
  <div className="mt-6">
    <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
    <Link
      href={invoice_link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:underline transition-colors"
    >
      {t.viewInvoice}
    </Link>
  </div>
);

const OrderCard = ({
  order,
  t,
}: {
  order: OrderType;
  t: (typeof accountOrdersTranslate)[typeof lang]["orderTracking"];
}) => (
  <div className="border p-6 rounded shadow-lg bg-white">
    <h2 className="text-2xl font-bold mb-4">
      {t.orderId} {order._id}
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ShippingInfo
        shipping_address={order.shipping_address}
        t={t.shipping_info}
      />
      <ItemsList items={order.items} t={t.items} />
    </div>

    <OrderStatusSection status={order.status} order={order} t={t.orderStatus} />

    <InvoiceSection invoice_link={order.invoice_link} t={t.invoice} />
  </div>
);

export default OrderCard;
