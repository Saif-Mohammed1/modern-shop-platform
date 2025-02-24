import { type NextRequest } from "next/server";

import { ProductService } from "../services/product.service";
import { ProductValidation } from "../dtos/product.dto";
import { NextResponse } from "next/server";
import { ReviewService } from "../services/review.service";
import { UserRole } from "../models/User.model";

class ProductController {
  private productService = new ProductService();
  private reviewService = new ReviewService();
  async createProduct(req: NextRequest) {
    try {
      const body = await req.json();
      const result = ProductValidation.validateCreateProduct({
        userId: req.user?._id,
        ...body,
      });
      const product = await this.productService.createProduct(result);
      return NextResponse.json({ product }, { status: 201 });
    } catch (err) {
      throw err;
    }
  }

  async updateProduct(req: NextRequest) {
    try {
      const body = await req.json();
      const result = ProductValidation.validateUpdateProduct(body);
      const product = await this.productService.updateProduct(req?.id, result);
      return NextResponse.json({ product }, { status: 200 });
    } catch (err) {
      throw err;
    }
  }

  async deleteProduct(req: NextRequest) {
    try {
      const product = await this.productService.deleteProduct(req?.id);
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
          },
          req.user?.role.includes(UserRole.ADMIN)
        ),
        this.productService.getProductsCategory(),
      ]);
      return NextResponse.json({ products, categories }, { status: 200 });
    } catch (err) {
      throw err;
    }
  }

  async getProductBySlug(req: NextRequest) {
    try {
      if (!req.slug) {
        return;
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
        return;
      }
      const product = await this.productService.getProductMetaDataBySlug(
        req?.slug
      );

      return NextResponse.json({ product }, { status: 200 });
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
}

export default new ProductController();
