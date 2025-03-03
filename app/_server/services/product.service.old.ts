import { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import ProductModel, { IProduct } from "../models/Product.model";
import { ProductRepository } from "../repositories/product.repository";
import AppError from "@/app/lib/utilities/appError";
import { productControllerTranslate } from "@/public/locales/server/productControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { destroyImage, uploadImage } from "@/app/lib/utilities/cloudinary";

export class ProductService {
  private repository = new ProductRepository(ProductModel);

  async createProduct(dto: CreateProductDto): Promise<IProduct> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      let uploadedImages: IProduct["images"] = []; // [];

      // If images are base64 strings, upload them
      if (typeof dto.images[0] === "string") {
        for (const image of dto.images as string[]) {
          this.validateBase64Image(image);
          const result = await uploadImage(image, "shop/shop-products");

          uploadedImages.push({
            link: result.secure_url,
            public_id: result.public_id,
          });
        }
      } else {
        // If already formatted as objects, keep them
        uploadedImages = dto.images as { link: string; public_id: string }[];
      }
      dto.images = uploadedImages;

      const product = await this.repository.create(dto, session);

      await session.commitTransaction();
      return product;
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }
  async updateProduct(
    slug: string,
    dto: UpdateProductDto
  ): Promise<IProduct | null> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      const product = await this.repository.update(slug, dto, session);
      await session.commitTransaction();
      return product;
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteProduct(slug: string): Promise<boolean> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      const product = await this.repository.getProductBySlug(slug);
      if (!product) {
        throw new AppError(
          productControllerTranslate[lang].errors.noProductFoundWithId,
          404
        );
      }
      if (product.images) {
        // const utapi = new UTApi();
        for (const image of product.images) {
          //   await utapi.deleteFiles(public_id);

          // for cloudainry
          await destroyImage(image.public_id);
        }
      }
      const result = await this.repository.delete(
        product._id.toString(),
        session
      );

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }
  async getProducts(options: QueryOptionConfig, isAdmin?: boolean) {
    return this.repository.getProducts(options, isAdmin);
  }
  async getProductById(id: string) {
    return this.repository.findById(id);
  }
  async getProductBySlug(slug: string) {
    return this.repository.getProductBySlug(slug);
  }
  async getProductMetaDataBySlug(slug: string) {
    return this.repository.getProductMetaDataBySlug(slug);
  }
  async getProductsCategory(): Promise<string[]> {
    return this.repository.getCategoryList();
  }
  async getProductsByCategory(category: string) {
    return this.repository.getProductsByCategory(category);
  }
  async deleteProductImages(slug: string, public_id: string) {
    const product = await this.repository.getProductBySlug(slug);
    if (!product) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }

    // Filter images to delete
    const imagesToDelete = product.images.filter((image) =>
      public_id.includes(image.public_id)
    );

    // Delete images from Cloudinary
    for (const image of imagesToDelete) {
      await destroyImage(image.public_id);
    }

    // Remove deleted images from the document
    product.images = product.images.filter(
      (image) => !public_id.includes(image.public_id)
    );
    await this.repository.updateProductImages(
      product._id.toString(),
      product.images
    );
    // // Save the updated document
    // await product.save();
  }
  validateBase64Image(image: string): void {
    // Split the base64 string into the prefix and the data
    const [prefix, data] = image.split(",");

    // Check the file type from the prefix (e.g., 'data:image/jpeg;base64')
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    const mimeTypeMatch = prefix.match(/data:(.*?);base64/);

    // Add a null check for mimeTypeMatch
    if (!mimeTypeMatch || !mimeTypeMatch[1]) {
      throw new AppError(
        productControllerTranslate[
          lang
        ].functions.validateBase64Image.invalidImageFormat,
        400
      );
    }

    const mimeType = mimeTypeMatch[1];

    if (!allowedTypes.includes(mimeType)) {
      throw new AppError(
        productControllerTranslate[
          lang
        ].functions.validateBase64Image.invalidImageType,
        400
      );
    }

    // Calculate the size of the image in bytes
    const imageSizeInBytes = (data.length * 3) / 4;
    const imageSizeInMB = imageSizeInBytes / (1024 * 1024);

    if (imageSizeInMB > 2) {
      throw new AppError(
        productControllerTranslate[
          lang
        ].functions.validateBase64Image.imageSizeExceeds,
        400
      );
    }
  }
  async getTopOffersAndNewProducts() {
    return this.repository.getTopOffersAndNewProducts();
  }
  async toggleProductActivity(slug: string) {
    return await this.repository.toggleProductActivity(slug);
  }
}
/**   topOfferProducts: products[0].topOfferProducts,
      newProducts: products[0].newProducts,
      topRating: products[0].topRating, */
// export default new ProductService();
// Compare this snippet from shop/app/_server/repositories/user.repository.ts:
