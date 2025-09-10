import { UserRole } from "@/app/lib/types/users.db.types";
import { AIQueryParserService } from "@/app/lib/utilities/ai-query-parser";
import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { productControllerTranslate } from "@/public/locales/server/productControllerTranslate";

import { ProductValidation } from "../../dtos/product.dto";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { ProductService } from "../../services/product.service";
import { ReviewService } from "../../services/review.service";
import { GlobalFilterValidator } from "../../validators/global-filter.validator";
import type { Context } from "../apollo-server";

const productService: ProductService = new ProductService();
const reviewService: ReviewService = new ReviewService();
const aiQueryParser: AIQueryParserService = new AIQueryParserService();
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
interface CreateProduct {
  name: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  sku?: string;
  reserved?: number;
  sold?: number;
  images: string[];
  shipping_info: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  user_id: string;
  active: boolean;
  discount?: number;
  discount_expire?: Date;
}
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

    getProductHistory: async (
      _parent: unknown,
      {
        slug,
        productHistoryFilter = {},
      }: {
        slug: string;
        productHistoryFilter?: {
          sort?: string;
          page?: number;
          limit?: number;
          actor?: string;
          action?: string;
        };
      },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const filter = GlobalFilterValidator.validate({
        ...productHistoryFilter,
      });
      const query = new URLSearchParams();
      if (filter?.sort) {
        query.append("sort", filter.sort);
      }
      if (filter?.page) {
        query.append("page", filter.page.toString());
      }
      if (filter?.limit) {
        query.append("limit", filter.limit.toString());
      }
      if (filter?.actor) {
        query.append("actor", filter.actor);
      }
      if (filter?.action) {
        query.append("action", filter.action);
      }

      const history = await productService.getProductHistory(slug, { query });
      return history;
    },
    aiSearchProducts: async (
      _parent: unknown,
      { query }: { query: string },
      _context: Context
    ) => {
      // User Query: ${query}
      const aiParams = await aiQueryParser.parseUserQuery(query);
      // AI Parsed Params: ${JSON.stringify(aiParams)}
      // Convert AI params to URLSearchParams like existing getProducts resolver
      const searchQuery = new URLSearchParams();

      // The AI parser now handles keyword extraction in its fallback
      // so aiParams.search should always have a meaningful search term
      if (aiParams.search) {
        searchQuery.append("search", aiParams.search);
      }

      if (aiParams.rating) {
        searchQuery.append("rating[gte]", aiParams.rating.toString());
        searchQuery.append("rating[lte]", "5");
      }
      // Add price filtering if AI detected price preferences
      if (aiParams.price_max) {
        searchQuery.append("price[lte]", aiParams.price_max.toString());
      }
      if (aiParams.price_min) {
        searchQuery.append("price[gte]", aiParams.price_min.toString());
      }
      // Search Query Params: ${searchQuery.toString()}
      const productsResult = await productService.getProducts({
        query: searchQuery,
      });
      // Products Result: ${JSON.stringify(productsResult)}
      return {
        products: productsResult,
        searchIntent: aiParams.intent || "AI-powered search",
        confidence: aiParams.confidence || 0.8,
        suggestions: aiParams.suggestions || [],
      };
    },
  },
  Mutation: {
    createProduct: async (
      _parent: unknown,
      { product }: { product: CreateProduct },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const user_id = String(req.user?._id);
      const dto = ProductValidation.validateCreateProduct({
        ...product,
        user_id,
      });

      const result = await productService.createProduct(dto);
      return { product: result };
    },

    updateProduct: async (
      _parent: unknown,
      { _id, product }: { _id: string; product: CreateProduct },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const user_id = String(req.user?._id);

      // First get the product to find its slug
      const existingProduct = await productService.getProductById(_id);
      if (!existingProduct) {
        throw new Error("Product not found");
      }

      const dto = ProductValidation.validateUpdateProduct({
        ...product,
        user_id,
      });

      const result = await productService.updateProduct(
        existingProduct.slug,
        dto,
        user_id
      );
      return result;
    },

    removeProductImage: async (
      _parent: unknown,
      { slug, public_id }: { slug: string; public_id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );

      const user_id = String(req.user?._id);
      await productService.deleteProductImages(slug, public_id, user_id);

      return { message: "Image removed successfully" };
    },

    deleteProduct: async (
      _parent: unknown,
      { _id }: { _id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );

      const user_id = String(req.user?._id);
      const result = await productService.deleteProduct(_id, user_id);

      return result;
    },

    toggleProductStatus: async (
      _parent: unknown,
      { slug }: { slug: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );

      const user_id = String(req.user?._id);
      await productService.toggleProductActivity(slug, user_id);

      // Return the updated product
      const updatedProduct = await productService.getProductBySlug(slug, {});
      return updatedProduct;
    },

    restoreProductVersion: async (
      _parent: unknown,
      { slug, versionId }: { slug: string; versionId: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const user_id = String(req.user?._id);

      const restoredProduct = await productService.restoreProductVersion(
        slug,
        versionId,
        user_id
      );
      return restoredProduct;
    },
  },
};
