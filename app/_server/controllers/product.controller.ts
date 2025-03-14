import { type NextRequest } from "next/server";

import { ProductService } from "../services/product.service";
import { ProductValidation } from "../dtos/product.dto";
import { NextResponse } from "next/server";
import { ReviewService } from "../services/review.service";
import { ProductTranslate } from "@/public/locales/server/Product.Translate";
import { lang } from "@/app/lib/utilities/lang";
import AppError from "@/app/lib/utilities/appError";
import { UserRole } from "@/app/lib/types/users.types";

class ProductController {
  private productService = new ProductService();
  private reviewService = new ReviewService();
  async createProduct(req: NextRequest) {
    try {
      const ipAddress =
        req.headers.get("x-client-ip") ||
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        req.ip;

      const userAgent = req.headers.get("user-agent");
      const logs = ProductValidation.validateProductLogs({
        ipAddress,
        userAgent,
      });
      const body = await req.json();
      const result = ProductValidation.validateCreateProduct({
        userId: req.user?._id,
        ...body,
      });

      const product = await this.productService.createProduct(result, logs);
      return NextResponse.json({ product }, { status: 201 });
    } catch (err) {
      throw err;
    }
  }

  async updateProduct(req: NextRequest) {
    try {
      if (!req?.slug || !req.user?._id) {
        throw new AppError(ProductTranslate[lang].slug, 400);
      }
      const ipAddress =
        req.headers.get("x-client-ip") ||
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        req.ip;
      const userAgent = req.headers.get("user-agent");
      const logs = ProductValidation.validateProductLogs({
        ipAddress,
        userAgent,
      });
      const body = await req.json();
      const result = ProductValidation.validateUpdateProduct(body);
      const product = await this.productService.updateProduct(
        req?.slug,
        result,
        req.user?._id,
        logs
      );
      return NextResponse.json({ product }, { status: 200 });
    } catch (err) {
      throw err;
    }
  }

  async deleteProduct(req: NextRequest) {
    try {
      if (!req?.slug || !req.user?._id) {
        throw new AppError(ProductTranslate[lang].slug, 400);
      }
      const ipAddress =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        req.ip;

      const userAgent = req.headers.get("user-agent");
      const logs = ProductValidation.validateProductLogs({
        ipAddress,
        userAgent,
      });
      const product = await this.productService.deleteProduct(
        req?.slug,
        req.user?._id,
        logs
      );
      return NextResponse.json({ product }, { status: 200 });
    } catch (err) {
      throw err;
    }
  }
  async getProducts(req: NextRequest) {
    try {
      const [products, categories] = await Promise.all([
        this.productService.getProducts(
          {
            query: req.nextUrl.searchParams,
            populate:
              req.user?.role.includes(UserRole.ADMIN) ||
              req.user?.role.includes(UserRole.MODERATOR),
          },
          req.user?.role.includes(UserRole.ADMIN) ||
            req.user?.role.includes(UserRole.MODERATOR)
        ),
        this.productService.getProductsCategory(),
      ]);
      return NextResponse.json({ products, categories }, { status: 200 });
    } catch (err) {
      throw err;
    }
  }
  async toggleProductActivity(req: NextRequest) {
    try {
      if (!req?.slug || !req.user?._id) {
        throw new AppError(ProductTranslate[lang].slug, 400);
      }
      await this.productService.toggleProductActivity(req.slug, req.user._id);
      return NextResponse.json(
        { message: ProductTranslate[lang].productActivityUpdatedSuccessfully },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async getProductBySlug(req: NextRequest) {
    try {
      if (!req.slug) {
        throw new AppError(ProductTranslate[lang].slug, 400);
      }
      const product = await this.productService.getProductBySlug(req?.slug);
      const distribution = product?._id
        ? await this.reviewService.getRatingDistributionByProductId(
            product._id.toString()
          )
        : null;
      return NextResponse.json({ product, distribution }, { status: 200 });
    } catch (err) {
      throw err;
    }
  }
  async getProductMetaDataBySlug(req: NextRequest) {
    try {
      if (!req.slug) {
        throw new AppError(ProductTranslate[lang].slug, 400);
      }
      const product = await this.productService.getProductMetaDataBySlug(
        req?.slug
      );

      return NextResponse.json({ product }, { status: 200 });
    } catch (err) {
      throw err;
    }
  }
  async deleteProductImages(req: NextRequest) {
    try {
      const { public_id } = await req.json();
      if (!public_id) {
        throw new AppError(ProductTranslate[lang].public_id, 400);
      }
      if (!req?.slug || !req.user?._id) {
        throw new AppError(ProductTranslate[lang].slug, 400);
      }
      const ipAddress =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        req.ip;

      const userAgent = req.headers.get("user-agent");
      const logs = ProductValidation.validateProductLogs({
        ipAddress,
        userAgent,
      });
      await this.productService.deleteProductImages(
        req?.slug,
        public_id,
        req.user?._id,
        logs
      );
      return NextResponse.json(
        { message: ProductTranslate[lang].deleteImageSuccess },
        { status: 200 }
      );
    } catch (err) {
      throw err;
    }
  }
  async getTopOffersAndNewProducts() {
    const result = await this.productService.getTopOffersAndNewProducts();
    return NextResponse.json(
      {
        topOfferProducts: result[0].topOfferProducts,
        newProducts: result[0].newProducts,
        topRating: result[0].topRating,
      },
      { status: 200 }
    );
  }
  async getProductHistory(req: NextRequest) {
    try {
      if (!req?.slug) {
        throw new AppError(ProductTranslate[lang].slug, 400);
      }
      const product = await this.productService.getProductHistory(req?.slug, {
        query: req.nextUrl.searchParams,
        populate:
          req.user?.role.includes(UserRole.ADMIN) ||
          req.user?.role.includes(UserRole.MODERATOR),
      });
      return NextResponse.json({ product }, { status: 200 });
    } catch (err) {
      throw err;
    }
  }
  async restoreProduct(req: NextRequest) {
    try {
      if (!req?.slug || !req.user?._id) {
        throw new AppError(ProductTranslate[lang].slug, 400);
      }
      const ipAddress =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        req.ip;

      const userAgent = req.headers.get("user-agent");
      const logs = ProductValidation.validateProductLogs({
        ipAddress,
        userAgent,
      });
      const { versionId } = await req.json();
      if (!versionId) {
        throw new AppError(ProductTranslate[lang].dto.versionId.required, 400);
      }
      const product = await this.productService.restoreProductVersion(
        req?.slug,
        versionId,
        req.user?._id,
        logs
      );
      return NextResponse.json({ product }, { status: 200 });
    } catch (err) {
      throw err;
    }
  }
}

export default new ProductController();
