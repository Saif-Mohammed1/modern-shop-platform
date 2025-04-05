import {ipAddress} from '@vercel/functions';
import {type NextRequest, NextResponse} from 'next/server';

import {UserRole} from '@/app/lib/types/users.types';
import AppError from '@/app/lib/utilities/appError';
import {lang} from '@/app/lib/utilities/lang';
import {ProductTranslate} from '@/public/locales/server/Product.Translate';

import {LogsValidation} from '../dtos/logs.dto';
import {ProductValidation} from '../dtos/product.dto';
import {ProductService} from '../services/product.service';
import {ReviewService} from '../services/review.service';

class ProductController {
  constructor(
    private readonly productService: ProductService = new ProductService(),
    private readonly reviewService: ReviewService = new ReviewService(),
  ) {}
  async createProduct(req: NextRequest) {
    const ip =
      req.headers.get('x-client-ip') ||
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      ipAddress(req) ||
      'Unknown IP';
    const userAgent = req.headers.get('user-agent') ?? 'Unknown User Agent';
    const logs = LogsValidation.validateLogs({
      ipAddress: ip,
      userAgent,
    });
    const body = await req.json();
    const result = ProductValidation.validateCreateProduct({
      userId: req.user?._id,
      ...body,
    });

    const product = await this.productService.createProduct(result, logs);
    return NextResponse.json({product}, {status: 201});
  }

  async updateProduct(req: NextRequest) {
    if (!req?.slug || !req.user?._id) {
      throw new AppError(ProductTranslate[lang].slug, 400);
    }
    const ip =
      req.headers.get('x-client-ip') ||
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      ipAddress(req) ||
      'Unknown IP';
    const userAgent = req.headers.get('user-agent') ?? 'Unknown User Agent';
    const logs = LogsValidation.validateLogs({
      ipAddress: ip,
      userAgent,
    });
    const body = await req.json();
    const result = ProductValidation.validateUpdateProduct(body);
    const product = await this.productService.updateProduct(req?.slug, result, req.user?._id, logs);
    return NextResponse.json({product}, {status: 200});
  }

  async deleteProduct(req: NextRequest) {
    if (!req?.slug || !req.user?._id) {
      throw new AppError(ProductTranslate[lang].slug, 400);
    }
    const ip =
      req.headers.get('x-client-ip') ||
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      ipAddress(req) ||
      'Unknown IP';
    const userAgent = req.headers.get('user-agent') ?? 'Unknown User Agent';
    const logs = LogsValidation.validateLogs({
      ipAddress: ip,
      userAgent,
    });
    const product = await this.productService.deleteProduct(req?.slug, req.user?._id, logs);
    return NextResponse.json({product}, {status: 200});
  }
  async getProducts(req: NextRequest) {
    const [products, categories] = await Promise.all([
      this.productService.getProducts(
        {
          query: req.nextUrl.searchParams,
          populate:
            req.user?.role.includes(UserRole.ADMIN) || req.user?.role.includes(UserRole.MODERATOR),
        },
        req.user?.role.includes(UserRole.ADMIN) || req.user?.role.includes(UserRole.MODERATOR),
      ),
      this.productService.getProductsCategory(),
    ]);
    return NextResponse.json({products, categories}, {status: 200});
  }
  async toggleProductActivity(req: NextRequest) {
    if (!req?.slug || !req.user?._id) {
      throw new AppError(ProductTranslate[lang].slug, 400);
    }
    await this.productService.toggleProductActivity(req.slug, req.user._id);
    return NextResponse.json(
      {message: ProductTranslate[lang].productActivityUpdatedSuccessfully},
      {status: 200},
    );
  }
  async getProductBySlug(req: NextRequest) {
    if (!req.slug) {
      throw new AppError(ProductTranslate[lang].slug, 400);
    }
    const product = await this.productService.getProductBySlug(req?.slug, {
      populate: true,
      select: 'rating comment userId createdAt',
    });
    const distribution = product?._id
      ? await this.reviewService.getRatingDistributionByProductId(product._id.toString())
      : null;
    return NextResponse.json({product, distribution}, {status: 200});
  }
  async getProductMetaDataBySlug(req: NextRequest) {
    if (!req.slug) {
      throw new AppError(ProductTranslate[lang].slug, 400);
    }
    const product = await this.productService.getProductMetaDataBySlug(req?.slug);

    return NextResponse.json(product, {status: 200});
  }
  async deleteProductImages(req: NextRequest) {
    const {public_id} = await req.json();
    if (!public_id) {
      throw new AppError(ProductTranslate[lang].public_id, 400);
    }
    if (!req?.slug || !req.user?._id) {
      throw new AppError(ProductTranslate[lang].slug, 400);
    }
    const ip =
      req.headers.get('x-client-ip') ||
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      ipAddress(req) ||
      'Unknown IP';

    const userAgent = req.headers.get('user-agent') ?? 'Unknown User Agent';
    const logs = LogsValidation.validateLogs({
      ipAddress: ip,
      userAgent,
    });
    await this.productService.deleteProductImages(req?.slug, public_id, req.user?._id, logs);
    return NextResponse.json({message: ProductTranslate[lang].deleteImageSuccess}, {status: 200});
  }
  async getTopOffersAndNewProducts() {
    const result = await this.productService.getTopOffersAndNewProducts();
    return NextResponse.json(
      {
        topOfferProducts: result[0].topOfferProducts,
        newProducts: result[0].newProducts,
        topRating: result[0].topRating,
      },
      {status: 200},
    );
  }
  async getProductHistory(req: NextRequest) {
    if (!req?.slug) {
      throw new AppError(ProductTranslate[lang].slug, 400);
    }
    const product = await this.productService.getProductHistory(req?.slug, {
      query: req.nextUrl.searchParams,
      populate:
        req.user?.role.includes(UserRole.ADMIN) || req.user?.role.includes(UserRole.MODERATOR),
    });
    return NextResponse.json({product}, {status: 200});
  }
  async restoreProduct(req: NextRequest) {
    if (!req?.slug || !req.user?._id) {
      throw new AppError(ProductTranslate[lang].slug, 400);
    }
    const ip =
      req.headers.get('x-client-ip') ||
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      ipAddress(req) ||
      'Unknown IP';

    const userAgent = req.headers.get('user-agent') ?? 'Unknown User Agent';
    const logs = LogsValidation.validateLogs({
      ipAddress: ip,
      userAgent,
    });
    const {versionId} = await req.json();
    if (!versionId) {
      throw new AppError(ProductTranslate[lang].dto.versionId.required, 400);
    }
    const product = await this.productService.restoreProductVersion(
      req?.slug,
      versionId,
      req.user?._id,
      logs,
    );
    return NextResponse.json({product}, {status: 200});
  }
}

export default new ProductController();
