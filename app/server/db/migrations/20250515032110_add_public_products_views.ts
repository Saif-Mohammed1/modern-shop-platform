import type { Knex } from "knex";

// Different format options:
// knex.raw("to_char(discount_expire, 'DD/MM/YYYY') as discount_expire"), // "02/09/2025"
// knex.raw("to_char(discount_expire, 'YYYY-MM-DD HH24:MI') as discount_expire"), // "2025-09-02 21:00"
// knex.raw("to_char(discount_expire, 'Day, DD Mon YYYY') as discount_expire"), // "Monday, 02 Sep 2025"
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createViewOrReplace("public_products_views", (view) => {
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
      "reviews",
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
            "to_char(products.discount_expire, 'DD/MM/YYYY') as discount_expire"
          ), // Moved to select
          "products.description",
          "products.stock",
          "products.ratings_average",
          "products.ratings_quantity",
          "products.slug",
          "products.reserved",
          "products.sold",
          "products.sku",
          knex.raw("to_char(products.created_at, 'DD/MM/YYYY') as created_at"),
          knex.raw(
            `COALESCE(json_agg(
            json_build_object(
              '_id', product_images._id,
              'link', product_images.link,
              'public_id', product_images.public_id
          )
          )
            FILTER (WHERE product_images._id IS NOT NULL), '[]') AS images`
          ),
          knex.raw(
            `COALESCE(
              json_build_object(
                'weight', product_shopping_info.weight,
                'dimensions', json_build_object(
                  'length', COALESCE(product_shopping_info.length, 0),
                  'width', COALESCE(product_shopping_info.width, 0),
                  'height', COALESCE(product_shopping_info.height, 0)
                )
              ) 
                ,
              '{}'::json
            ) AS shipping_info`
          ),
          knex.raw(`
            COALESCE(
              json_agg(
                json_build_object(
                  '_id', reviews._id,
                  'user_name', users.name,
                  'product_id', reviews.product_id,
                  'rating', reviews.rating,
                  'comment', reviews.comment,
                  'created_at', to_char(reviews.created_at, 'DD/MM/YYYY')
                )
              ) FILTER (WHERE reviews._id IS NOT NULL),
              '[]'
            ) AS reviews
          `)
        )
        .leftJoin("product_images", "products._id", "product_images.product_id")
        .leftJoin(
          "product_shopping_info",
          "products._id",
          "product_shopping_info.product_id"
        )
        .leftJoin("reviews", "products._id", "reviews.product_id")
        .leftJoin("users", "reviews.user_id", "users._id")
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
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropViewIfExists("public_products_views");
}
/** knex.raw(`
        SELECT 
            p._id,
            p.name,
            p.category,
            p.price,
            p.discount,
            p.discount_expire,
            p.description,
            p.stock,    
            p.ratings_average,
            p.ratings_quantity,
            p.slug,
            COALESCE(json_agg(pi) FILTER (WHERE pi._id IS NOT NULL), '[]') AS images,
            json_build_object(
                'weight', psi.weight,
                'dimensions', json_build_object(
                    'length', psi.dimensions_length,
                    'width', psi.dimensions_width,
                    'height', psi.dimensions_height
                )
            ) AS shipping_info,
            COALESCE(json_agg(r) FILTER (WHERE r._id IS NOT NULL), '[]') AS reviews
        FROM products p
        LEFT JOIN product_images pi ON p._id = pi.product_id
        LEFT JOIN product_shopping_info psi ON p._id = psi.product_id
        LEFT JOIN reviews r ON p._id = r.product_id
        WHERE p.active = true
        AND p.stock > 0
        GROUP BY 
            p._id, 
            p.name, 
            p.category, 
            p.price, 
            p.discount, 
            p.discount_expire, 
            p.description, 
            p.stock, 
            p.ratings_average, 
            p.ratings_quantity, 
            p.slug,
            psi.weight,
            psi.dimensions_length,
            psi.dimensions_width,
            psi.dimensions_height
      `) */
