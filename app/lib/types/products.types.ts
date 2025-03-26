import type { ReviewsType } from "./reviews.types";
import type { UserAuthType } from "./users.types";

export type ProductsSearchParams = {
  category?: string;
  name?: string;
  search?: string;
  sort?: string;
  fields?: string;
  page?: string;
  limit?: string;
  rating?: string;
  min?: string;
  max?: string;
};

export type Event = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;

export type OldImage = {
  public_id: string;
  link: string;
};
// type UserAuthType = {
//   name: string;
//   _id: string;
// };
export type ProductType = {
  _id: string;

  name: string;
  category: string;
  price: number;
  discount: number;
  discountExpire?: Date;
  images: OldImage[] | [];
  userId: Partial<UserAuthType>;
  description: string;
  stock: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: string;
  slug: string;
  active: boolean;
  reserved?: number;
  lastReserved?: Date;
  sold?: number;

  sku: string;
  attributes?: Record<string, any>;
  shippingInfo: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  reviews: ReviewsType[];
  lastModifiedBy?: UserAuthType;
};
