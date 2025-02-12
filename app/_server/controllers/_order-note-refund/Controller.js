import AppError from "@/app/lib/util/appError";
import Note from "../../models/note.model ";
import Order from "../../models/order.model ";
import Refund from "../../models/refund.model";

export const createOrder = async (req) => {
  let doc;
  try {
    let { invoiceId, invoiceLink } = await req.json();
    if (!invoiceId || !invoiceLink) {
      throw new AppError("You Need to provide  data", 400);
    }

    doc = await Order.create({
      user: req?.user?._id,
      invoiceId,
      invoiceLink,
    });

    return {
      data: doc,
      statusCode: 201,
    };
  } catch (error) {
    if (doc) {
      await Order.findByIdAndDelete(doc._id);
    }
    throw error;
  }
};
export const createNote = async (req) => {
  let doc;
  try {
    let { issue, invoiceId, message } = await req.json();
    if (!issue || !invoiceId || !message) {
      throw new AppError("You Need to provide  data", 400);
    }
    const existingInvoice = await Order.findOne({
      user: req?.user?._id,
      invoiceId,
    });
    if (!existingInvoice) {
      throw new AppError("invalid Invoice Id ", 404);
    }
    doc = await Note.create({
      user: req?.user?._id,

      invoiceId,
    });

    return {
      data: doc,
      statusCode: 201,
    };
  } catch (error) {
    if (doc) {
      await Note.findByIdAndDelete(doc._id);
    }
    throw error;
  }
};
export const createRefund = async (req) => {
  let doc;
  try {
    let { invoiceId } = await req.json();
    if (!invoiceId) {
      throw new AppError("You Need to provide  data", 400);
    }
    const existingInvoice = await Order.findOne({
      user: req?.user?._id,
      invoiceId,
    });
    if (!existingInvoice) {
      throw new AppError("invalid Invoice Id ", 404);
    }
    doc = await Refund.create({
      user: req?.user?._id,

      invoiceId,
    });

    return {
      data: doc,
      statusCode: 201,
    };
  } catch (error) {
    if (doc) {
      await Refund.findByIdAndDelete(doc._id);
    }
    throw error;
  }
};
