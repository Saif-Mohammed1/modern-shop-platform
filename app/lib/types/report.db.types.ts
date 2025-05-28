export interface IReportDB {
  _id: string;
  reporter_id: string;
  product_id: string;
  status: "pending" | "resolved" | "rejected";
  name: string;
  issue: string;
  message: string;
  created_at: Date;
  updated_at: Date;
}
