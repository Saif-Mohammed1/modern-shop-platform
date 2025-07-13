import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createViewOrReplace("orders_view", (view) => {
    view.columns([
      "_id",
      "user_id",
      "user_info",
      "invoice_id",
      "invoice_link",
      "currency",
      "subtotal",
      "tax",
      "total",
      "order_notes",
      "cancellation_reason",
      "payment",
      "status",
      "created_at",
      "updated_at",
      "items",
      "shipping_address",
    ]);
    view.as(
      knex
        .select(
          "orders._id",
          "orders.user_id",
          knex.raw(
            "JSON_BUILD_OBJECT('name', users.name, 'email', users.email) AS user_info"
          ),
          "orders.invoice_id",
          "orders.invoice_link",
          "orders.currency",
          "orders.subtotal",
          "orders.tax",
          "orders.total",
          "orders.order_notes",
          "orders.cancellation_reason",
          knex.raw(
            `JSON_BUILD_OBJECT(
                'method', orders.payment->>'method',
                'transaction_id', orders.payment->>'transaction_id'
              ) AS payment`
          ),
          "orders.status",
          knex.raw(
            `TO_CHAR(orders.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at`
          ),
          knex.raw(
            `TO_CHAR(orders.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at`
          ),

          knex.raw(
            `jsonb_agg(
                json_build_object(
                  'product_id', order_items.product_id,
                  'name', order_items.name,
                  'price', order_items.price,
                  'discount', order_items.discount,
                  'quantity', order_items.quantity,
                  'sku', order_items.sku,
                  'shipping_info_weight', order_items.shipping_info_weight,
                  'shipping_info_dimensions', order_items.shipping_info_dimensions,
                  'final_price', order_items.final_price
                )
              ) AS items`
          ),
          knex.raw(
            `JSON_BUILD_OBJECT(
          'street', order_shipping_address.street,
          'city', order_shipping_address.city,
          'state', order_shipping_address.state,
          'postal_code', order_shipping_address.postal_code,
          'phone', order_shipping_address.phone,
          'country', order_shipping_address.country
        ) AS order_shipping_address`
          )
        )
        .from("orders")
        .leftJoin("order_items", "order_items.order_id", "orders._id")
        .leftJoin(
          "order_shipping_address",
          "order_shipping_address.order_id",
          "orders._id"
        )
        .leftJoin("users", "users._id", "orders.user_id")
        .groupBy(
          "orders._id",
          "users.name",
          "users.email",
          "order_shipping_address.street",
          "order_shipping_address.city",
          "order_shipping_address.state",
          "order_shipping_address.postal_code",
          "order_shipping_address.phone",
          "order_shipping_address.country"
        )
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropViewIfExists("orders_view");
}
