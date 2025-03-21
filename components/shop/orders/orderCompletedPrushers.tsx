import { OrderType } from "@/app/lib/types/orders.types";
import { lang } from "@/app/lib/utilities/lang";
import { accountOrdersTranslate } from "@/public/locales/client/(auth)/account/ordersTranslate";
import Link from "next/link";
import { FaHome, FaTruck } from "react-icons/fa";
import { formatCurrency } from "@/app/lib/utilities/formatCurrency";
import { formatDateTime } from "@/app/lib/utilities/formatDate";

const OrderCompleted = ({ order }: { order: OrderType }) => {
  const t = accountOrdersTranslate[lang].orderCompleted;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-green-600 mb-4 text-center">
          {t.message}
        </h1>

        <OrderSummary order={order} t={t.summery} />
        <ProductList items={order.items} t={t.summery.Items} />
        <ActionButtons t={t.button} />
      </div>
    </div>
  );
};

// Sub-components
const OrderSummary = ({
  order,
  t,
}: {
  order: OrderType;
  t: (typeof accountOrdersTranslate)[typeof lang]["orderCompleted"]["summery"];
}) => (
  <div className="border-t border-gray-200 pt-4">
    <p className="text-lg mb-2">
      {t.orderId}: <span className="font-semibold">{order._id}</span>
    </p>
    <p className="text-lg mb-2">
      {t.orderDate}:{" "}
      <span className="font-semibold">{formatDateTime(order.createdAt)}</span>
    </p>
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

const ProductList = ({
  items,
  t,
}: {
  items: OrderType["items"];
  t: (typeof accountOrdersTranslate)[typeof lang]["orderCompleted"]["summery"]["Items"];
}) => (
  <>
    <h2 className="text-xl font-bold mb-2">{t.title}:</h2>
    <ul className="mb-4 max-h-96 overflow-y-auto">
      {items.map((item) => (
        <ProductListItem key={item.productId.toString()} item={item} t={t} />
      ))}
    </ul>
  </>
);

const ProductListItem = ({
  item,
  t,
}: {
  item: OrderType["items"][number];
  t: (typeof accountOrdersTranslate)[typeof lang]["orderCompleted"]["summery"]["Items"];
}) => {
  const hasDiscount = item.discount > 0;

  return (
    <li className="flex justify-between items-center mb-2">
      <div>
        <p className="text-lg">{item.name}</p>
        <p className="text-sm text-gray-500">
          {t.quantity}: {item.quantity}
        </p>
        {hasDiscount && (
          <>
            <p className="text-sm text-green-600">
              {t.discountApplied}: {formatCurrency(item.discount)}
            </p>
          </>
        )}
      </div>
      <PriceDisplay item={item} hasDiscount={hasDiscount} />
    </li>
  );
};

const PriceDisplay = ({
  item,
  hasDiscount,
}: {
  item: OrderType["items"][number];
  hasDiscount: boolean;
}) => (
  <div>
    {hasDiscount ? (
      <>
        <p className="line-through text-sm text-gray-500">
          {formatCurrency(item.price)}
        </p>
        <p className="font-semibold text-green-600">
          {formatCurrency(item.finalPrice)}
        </p>
      </>
    ) : (
      <p className="font-semibold">{formatCurrency(item.price)}</p>
    )}
  </div>
);

const ActionButtons = ({
  t,
}: {
  t: (typeof accountOrdersTranslate)[typeof lang]["orderCompleted"]["button"];
}) => (
  <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
    <ActionButton
      href="/account/orders"
      icon={<FaTruck />}
      text={t.orderTracking}
      className="bg-blue-600 hover:bg-blue-700"
    />
    <ActionButton
      href="/"
      icon={<FaHome />}
      text={t.backToHome}
      className="bg-gray-600 hover:bg-gray-700"
    />
  </div>
);

const ActionButton = ({
  href,
  icon,
  text,
  className,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
  className: string;
}) => (
  <Link
    href={href}
    className={`${className} text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors duration-200`}
  >
    {icon}
    <span className="ml-2">{text}</span>
  </Link>
);

export default OrderCompleted;
