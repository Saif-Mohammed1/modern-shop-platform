import { OrderStatus, type OrderType } from "@/app/lib/types/orders.types";
import { accountOrdersTranslate } from "@/public/locales/client/(auth)/account/ordersTranslate";
import { lang } from "@/app/lib/utilities/lang";
import Link from "next/link";
import { formatCurrency } from "@/app/lib/utilities/formatCurrency";
import FetchMoreOrders from "./fetchMoreOrders";

const UserOrderTracking = ({
  orders,
  hasNextPage,
}: {
  orders: OrderType[];
  hasNextPage: boolean;
}) => {
  const t = accountOrdersTranslate[lang].orderTracking;

  if (orders.length === 0) {
    return (
      <p className="text-center mt-6">
        {accountOrdersTranslate[lang].noOrdersFound}
      </p>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* <h1 className="text-3xl font-semibold mb-6 text-center">
        {accountOrdersTranslate[lang].title}
      </h1> */}

      <div className="max-h-[80vh] overflow-y-auto space-y-6">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} t={t} />
        ))}
      </div>

      <FetchMoreOrders showMore={hasNextPage} />
    </div>
  );
};

// Sub-components
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
        shippingAddress={order.shippingAddress}
        t={t.shippingInfo}
      />
      <ItemsList items={order.items} t={t.items} />
    </div>

    <OrderStatusSection status={order.status} order={order} t={t.orderStatus} />

    <InvoiceSection invoiceLink={order.invoiceLink} t={t.invoice} />
  </div>
);

const ShippingInfo = ({
  shippingAddress,
  t,
}: {
  shippingAddress: OrderType["shippingAddress"];
  t: (typeof accountOrdersTranslate)[typeof lang]["orderTracking"]["shippingInfo"];
}) => (
  <div>
    <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
    <address className="not-italic">
      <p>{shippingAddress.street}</p>
      <p>
        {shippingAddress.city}, {shippingAddress.state}
      </p>
      <p>{shippingAddress.postalCode}</p>
      <p>{shippingAddress.country}</p>
      <p className="mt-2">
        {t.phone}: {shippingAddress.phone}
      </p>
    </address>
  </div>
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
        <OrderItem key={item.productId.toString()} item={item} t={t} />
      ))}
    </ul>
  </div>
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
    <ItemDetail label={t.finalPrice} value={formatCurrency(item.finalPrice)} />
  </li>
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
  invoiceLink,
  t,
}: {
  invoiceLink: string;
  t: (typeof accountOrdersTranslate)[typeof lang]["orderTracking"]["invoice"];
}) => (
  <div className="mt-6">
    <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
    <Link
      href={invoiceLink}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:underline transition-colors"
    >
      {t.viewInvoice}
    </Link>
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

export default UserOrderTracking;
