import type { Knex } from "knex";

import type { IRefundDB } from "@/app/lib/types/refund.db.types";

export class RefundRepository {
  constructor(
    private readonly knex: Knex,
    private readonly tableName: string = "refunds"
  ) {}

  async create(refund: IRefundDB): Promise<IRefundDB> {
    const [created] = (await this.knex(this.tableName)
      .insert(refund)
      .returning("*")) as IRefundDB[];
    return created;
  }

  async findById(id: string): Promise<IRefundDB | null> {
    const [refund] = (await this.knex(this.tableName).where(
      "_id",
      id
    )) as IRefundDB[];
    return refund || null;
  }

  async findByUserId(userId: string): Promise<{
    docs: IRefundDB[];
    meta: { total: number; hasNext: boolean; limit: number; page: number };
  }> {
    const refunds = (await this.knex(this.tableName)
      .where("user_id", userId)
      .orderBy("created_at", "desc")) as IRefundDB[];

    return {
      docs: refunds,
      meta: {
        total: refunds.length,
        hasNext: false,
        limit: 10,
        page: 1,
      },
    };
  }

  async findWithFilters(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    docs: IRefundDB[];
    meta: { total: number; hasNext: boolean; limit: number; page: number };
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    let query = this.knex(this.tableName);

    if (filters.status) {
      query = query.where("status", filters.status);
    }

    const refunds = (await query
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)) as IRefundDB[];

    const [{ count }] = (await this.knex(this.tableName).count(
      "_id as count"
    )) as Array<{ count: string }>;
    const total = Number(count);

    return {
      docs: refunds,
      meta: {
        total,
        hasNext: offset + limit < total,
        limit,
        page,
      },
    };
  }

  async findByInvoiceId(invoiceId: string): Promise<IRefundDB[]> {
    return (await this.knex(this.tableName)
      .where("invoice_id", invoiceId)
      .orderBy("created_at", "desc")) as IRefundDB[];
  }

  async findPendingRefunds(): Promise<IRefundDB[]> {
    return (await this.knex(this.tableName)
      .where("status", "pending")
      .orderBy("created_at", "asc")) as IRefundDB[];
  }

  async getRefundStatistics(): Promise<{
    totalRefunds: number;
    pendingRefunds: number;
    approvedRefunds: number;
    rejectedRefunds: number;
    totalRefundAmount: number;
  }> {
    const [stats] = (await this.knex(this.tableName).select(
      this.knex.raw("COUNT(*) as total_refunds"),
      this.knex.raw(
        "COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_refunds"
      ),
      this.knex.raw(
        "COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_refunds"
      ),
      this.knex.raw(
        "COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_refunds"
      ),
      this.knex.raw("COALESCE(SUM(amount), 0) as total_refund_amount")
    )) as Array<{
      total_refunds: string;
      pending_refunds: string;
      approved_refunds: string;
      rejected_refunds: string;
      total_refund_amount: string;
    }>;

    return {
      totalRefunds: Number(stats.total_refunds),
      pendingRefunds: Number(stats.pending_refunds),
      approvedRefunds: Number(stats.approved_refunds),
      rejectedRefunds: Number(stats.rejected_refunds),
      totalRefundAmount: Number(stats.total_refund_amount),
    };
  }

  async updateStatus(
    refundId: string,
    status: string,
    notes?: string
  ): Promise<IRefundDB | null> {
    const updateData: Partial<IRefundDB> = {
      status: status as IRefundDB["status"],
      updated_at: new Date(),
    };

    if (notes) {
      updateData.issue = notes;
    }

    const [updated] = (await this.knex(this.tableName)
      .where("_id", refundId)
      .update(updateData)
      .returning("*")) as IRefundDB[];

    return updated || null;
  }

  async findByStatus(status: string): Promise<IRefundDB[]> {
    return (await this.knex(this.tableName)
      .where("status", status)
      .orderBy("created_at", "desc")) as IRefundDB[];
  }

  async delete(refundId: string): Promise<boolean> {
    const deleted = await this.knex(this.tableName)
      .where("_id", refundId)
      .del();
    return deleted > 0;
  }
}
