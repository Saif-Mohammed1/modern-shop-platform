export interface IProductDB {
  _id: string;
  name: string;
  category: string;
  price: number;
  discount: number;
  discount_expire?: Date;
  user_id: string;
  description: string;
  stock: number;
  ratings_average: number;
  ratings_quantity: number;
  active: boolean;
  slug: string;
  reserved: number;
  last_reserved?: Date;
  sold: number;
  sku: string;
  //   attributes: Record<string, any>;

  last_modified_by: string;
  created_at: Date;
  updated_at: Date;
}
export interface IProductShoppingInfoDB {
  product_id: string;
  weight: number;
  // dimensions: {
  length: number;
  width: number;
  height: number;
}

export interface IProductImagesDB {
  _id: string;
  product_id: string;
  link: string;
  public_id: string;
  created_at: Date;
}
export interface IReviewDB {
  _id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
}
export interface IJoinedProductDB extends IProductDB {
  images: IProductImagesDB[];
  shopping_info: IProductShoppingInfoDB;
  reviews: IReviewDB[];
}
// attributes: IProductAttributesDB[];
//   category: ICategoryDB;
//   user: IUserDB;
//   reviews: IReviewDB[];
export interface IProductViewDB {
  _id: string;
  name: string;
  category: string;
  price: number;
  discount: number;
  discount_expire?: Date;
  description: string;
  stock: number;
  ratings_average: number;
  ratings_quantity: number;
  slug: string;
  reserved: number;
  sold: number;
  sku: string;
  created_at: string; // formatted as 'DD/MM/YYYY'
  images: {
    _id: string;
    link: string;
    public_id: string;
  }[];
  shipping_info: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  reviews: {
    _id: string;
    user_name: string;
    // product_id: string;
    rating: number;
    comment: string;
    created_at: string; // formatted as 'DD/MM/YYYY'
  }[];
}
export interface IProductViewBasicDB extends Omit<IProductViewDB, "reviews"> {}
export interface IReservationDB {
  _id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: "pending" | "confirmed" | "cancelled";
  // Timestamps
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
}
