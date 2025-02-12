import { Model } from "mongoose";
import { NextRequest } from "next/server";
import { IAddressSchema } from "../models/address.model";
import AppError from "@/app/lib/util/appError";

export const updateAddress = async (
  req: NextRequest,
  model: Model<IAddressSchema>
) => {
  try {
    const data = await req.json();
    const doc = await model.findByIdAndUpdate(
      {
        _id: req?.id,
        user: req.user?._id,
      },
      {
        ...data,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!doc) {
      throw new AppError("No document found with this ID", 404);
    }
    return {
      data: doc,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteAddress = async (
  req: NextRequest,
  model: Model<IAddressSchema>
) => {
  try {
    const doc = await model.findByIdAndDelete({
      _id: req?.id,
      user: req.user?._id,
    });
    if (!doc) {
      throw new AppError("No document found with this ID", 404);
    }
    return {
      data: null,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
