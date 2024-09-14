import AppError from "@/components/util/appError";
import User from "../models/user.model";

export const createUserOrder = async (req, Model) => {
  let doc;

  try {
    let { email, invoiceId, invoiceLink } = await req.json();

    if (!email || !invoiceId || !invoiceLink) {
      throw new AppError("You Need to provide  data", 400);
    }
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError("user is invalid ", 400);
    }
    doc = await Model.create({
      user: user._id,

      invoiceId,
      invoiceLink,
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

export const getLatestOrder = async (req, Model) => {
  try {
    const doc = await Model.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    if (!doc) {
      throw new AppError("No order found", 404);
    }
    return {
      data: doc,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
