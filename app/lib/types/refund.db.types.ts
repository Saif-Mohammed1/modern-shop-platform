export interface IRefundDB {
  _id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  issue: string;
  reason: string;
  invoice_id: string;
  amount: number;
  created_at: Date;
  updated_at: Date;
}
