import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { productControllerTranslate } from "@/public/locales/server/productControllerTranslate";

import { ProductService } from "../../services/product.service";
import { ReviewService } from "../../services/review.service";
import type { Context } from "../apollo-server";

const productService: ProductService = new ProductService();
const reviewService: ReviewService = new ReviewService();
type SearchParams = {
  category?: string;
  name?: string;
  search?: string;
  sort?: string;
  fields?: string;
  page?: number;
  limit?: number;
  rating?: number;
};
export const shopResolvers = {
  Query: {
    getProducts: async (
      _parent: unknown,
      {
        filter = {},
      }: {
        filter: SearchParams;
      },
      _context: Context
    ) => {
      const query = new URLSearchParams();
      if (filter?.category) {
        query.append("category", filter.category);
      }
      if (filter?.name) {
        query.append("name", filter.name);
      }
      if (filter?.search) {
        query.append("search", filter.search);
      }
      if (filter?.sort) {
        query.append("sort", filter.sort);
      }
      if (filter?.fields) {
        query.append("fields", filter.fields);
      }
      if (filter?.page) {
        query.append("page", filter.page.toString());
      }
      if (filter?.limit) {
        query.append("limit", filter.limit.toString());
      }
      if (filter?.rating) {
        query.append("rating[gte]", filter.rating.toString());
        query.append("rating[lte]", "5");
      }
      const [productsResult, categories] = await Promise.all([
        productService.getProducts({
          query,
        }),
        productService.getProductsCategory(),
      ]);
      return { products: productsResult, categories };
    },
    getProductBySlug: async (
      _parent: unknown,
      { slug, populate = false }: { slug: string; populate?: boolean },
      _context: Context
    ) => {
      const product = await productService.getProductBySlug(slug, { populate });
      if (!product) {
        throw new AppError(
          productControllerTranslate[lang].errors.noProductFoundWithId,
          404
        );
      }
      const distribution = product?._id
        ? await reviewService.getRatingDistributionByProductId(
            product._id.toString()
          )
        : null;

      // Transform the distribution to match GraphQL schema

      return {
        product,
        distribution,
      };
    },

    getTopOffersAndNewProducts: async (
      _parent: unknown,
      _args: unknown,
      _context: Context
    ) => {
      const products = await productService.getTopOffersAndNewProducts();
      return products;
    },
  },
  Mutation: {
    createProduct: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await productService.createProduct(req);
      return { message: "Product created successfully" };
    },
  },
};
