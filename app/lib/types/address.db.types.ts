export interface IAddressDB {
  _id: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  country: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}
export type AddressType = {
  _id: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  country: string;
};
