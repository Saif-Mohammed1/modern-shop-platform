import AppError from "@/components/util/appError";
import User from "../models/user.model";
import Order from "../models/order.model ";

export const createRefund = async (req, Model) => {
  let doc;
  try {
    let { issue, message, invoiceId } = await req.json();

    ////console.log("issue", issue);
    ////console.log("message", message);
    ////console.log("invoiceId", invoiceId);
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
    doc = await Model.create({
      user: req?.user?._id,

      issue,
      invoiceId,
      reason: message,
    });

    return {
      data: doc,
      statusCode: 201,
    };
  } catch (error) {
    if (doc) {
      await Model.findByIdAndDelete(doc._id);
    }
    throw error;
  }
};
export const updateRefundStatus = async (req, Model) => {
  try {
    let { email, status } = await req.json();
    if (!email || !status) {
      throw new AppError("You Need to provide  data", 400);
    }
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError("user is invalid ", 400);
    }
    const doc = await Model.findOneAndUpdate(
      {
        user: user._id,
      },
      { status },
      { new: true, runValidators: true }
    );

    return {
      data: doc,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
