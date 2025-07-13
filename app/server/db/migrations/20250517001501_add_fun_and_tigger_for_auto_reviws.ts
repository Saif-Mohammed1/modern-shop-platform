import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Check if tables exist
  const hasTables =
    (await knex.schema.hasTable("products")) &&
    (await knex.schema.hasTable("reviews"));
  if (!hasTables) {
    throw new Error("Required tables (products or reviews) do not exist");
  }

  // Drop existing trigger if it exists (for compatibility with older PostgreSQL versions)
  await knex.raw(`
    DROP TRIGGER IF EXISTS trigger_update_product_rating ON public.reviews;
  `);

  // Create the function
  await knex.raw(`
    CREATE OR REPLACE FUNCTION public.update_product_rating()
    RETURNS TRIGGER AS $$
    DECLARE
      avg_rating numeric := 0;
      total_reviews integer := 0;
      target_product_id uuid;
    BEGIN
      -- Determine the target product ID based on operation
      target_product_id := COALESCE(NEW.product_id, OLD.product_id);

      -- Calculate average and total review count
      SELECT ROUND(AVG(r.rating)::numeric, 1), COUNT(*)
      INTO avg_rating, total_reviews
      FROM public.reviews r
      WHERE r.product_id = target_product_id;

      -- Update the corresponding product
      UPDATE public.products
      SET
        ratings_average = COALESCE(avg_rating, 0),
        ratings_quantity = total_reviews
      WHERE _id = target_product_id;

      RETURN NULL; -- Required for AFTER triggers
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error in update_product_rating: %', SQLERRM;
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    COMMENT ON FUNCTION public.update_product_rating() IS
    'Updates ratings_average and ratings_quantity in the products table when a review is inserted, updated, or deleted.';
  `);

  // Create the trigger
  await knex.raw(`
    CREATE TRIGGER trigger_update_product_rating
    AFTER INSERT OR UPDATE OF rating OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_product_rating();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TRIGGER IF EXISTS trigger_update_product_rating ON public.reviews;
    DROP FUNCTION IF EXISTS public.update_product_rating();
  `);
}
