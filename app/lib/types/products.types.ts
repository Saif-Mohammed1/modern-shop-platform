import type { ReviewsType } from "./reviews.db.types";
import type { IUserDB } from "./users.db.types";
// import type { UserAuthType } from "./users.db.types";

export type ProductsSearchParams = {
  category?: string;
  name?: string;
  search?: string;
  sort?: string;
  fields?: string;
  page?: number;
  limit?: number;
  rating?: number;
  min?: number;
  max?: number;
};

export type Event = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;

export type OldImage = {
  _id: string;
  public_id: string;
  link: string;
};

export type ProductType = {
  _id: string;
  name: string;
  category: string;
  price: number;
  discount?: number;
  discount_expire?: Date;
  description: string;
  stock: number;
  ratings_average: number;
  ratings_quantity: number;
  slug: string;
  reserved: number;
  sold: number;
  created_at: string; // formatted as 'DD/MM/YYYY'
  sku: string;
  images: OldImage[] | [];
  shipping_info: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  reviews: ReviewsType[];
};
export interface AdminProductType extends Omit<ProductType, "reviews"> {
  active: boolean;
  last_reserved: Date;

  // attributes?: Record<string, any>;

  last_modified_by: Pick<IUserDB, "_id" | "name">;
}
