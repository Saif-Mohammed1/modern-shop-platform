export interface IWishlistDB {
  _id: string;
  user_id: string;

  product_id: string;
  created_at: Date;
  updated_at: Date;
}
