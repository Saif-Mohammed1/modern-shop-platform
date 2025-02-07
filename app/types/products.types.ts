import { UserAuthType } from "./users.types";

export type ProductsSearchParams = {
  category?: string;
  name?: string;
  sort?: string;
  fields?: string;
  page?: string;
  limit?: string;
  rating?: string;
  min?: string;
  max?: string;
};

export type Event = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;

type OldImage = {
  public_id: string;
  link: string;
};
// type UserAuthType = {
//   name: string;
//   _id: string;
// };
export type ProductType = {
  name: string;
  category: string;
  price: number;
  discount: number;
  discountExpire?: Date;
  images: OldImage[] | [];
  user: Partial<UserAuthType>;
  description: string;
  stock: number;
  // _id: mongoose.Schema.Types.ObjectId | string;
  _id: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: string;
  slug: string;
  active: boolean;
};
