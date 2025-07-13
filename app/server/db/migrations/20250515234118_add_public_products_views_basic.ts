import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createViewOrReplace(
    "public_products_views_basic",
    (view) => {
      view.columns([
        "_id",
        "name",
        "category",
        "price",
        "discount",
        "discount_expire",
        "description",
        "stock",
        "ratings_average",
        "ratings_quantity",
        "slug",
        "reserved",
        "sold",
        "sku",
        "created_at",
        "images",
        "shipping_info",
      ]);
      view.as(
        knex("products")
          .select(
            "products._id",
            "products.name",
            "products.category",
            "products.price",
            "products.discount",
            knex.raw(
              `to_char(products.discount_expire, 'DD/MM/YYYY') as discount_expire`
            ),
            "products.description",
            "products.stock",
            "products.ratings_average",
            "products.ratings_quantity",
            "products.slug",
            "products.reserved",
            "products.sold",
            "products.sku",
            knex.raw(
              "to_char(products.created_at, 'DD/MM/YYYY') as created_at"
            ),
            knex.raw(`
            COALESCE(json_agg(json_build_object(
              '_id', product_images._id,
              'link', product_images.link,
              'public_id', product_images.public_id
            )) FILTER (WHERE product_images._id IS NOT NULL), '[]') AS images
          `),
            knex.raw(`
            COALESCE(json_build_object(
              'weight', product_shopping_info.weight,
              'dimensions', json_build_object(
                'length', COALESCE(product_shopping_info.length, 0),
                'width', COALESCE(product_shopping_info.width, 0),
                'height', COALESCE(product_shopping_info.height, 0)
              )
            ), '{}'::json) AS shipping_info
          `)
          )
          .leftJoin(
            "product_images",
            "products._id",
            "product_images.product_id"
          )
          .leftJoin(
            "product_shopping_info",
            "products._id",
            "product_shopping_info.product_id"
          )
          .where("products.active", true)
          .where("products.stock", ">", 0)
          .groupBy(
            "products._id",
            "products.name",
            "products.category",
            "products.price",
            "products.discount",
            "products.discount_expire",
            "products.description",
            "products.stock",
            "products.ratings_average",
            "products.ratings_quantity",
            "products.slug",
            "products.reserved",
            "products.sold",
            "products.sku",
            "products.created_at",
            "product_shopping_info.weight",
            "product_shopping_info.length",
            "product_shopping_info.width",
            "product_shopping_info.height"
          )
      );
    }
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropViewIfExists("public_products_views_basic");
}
