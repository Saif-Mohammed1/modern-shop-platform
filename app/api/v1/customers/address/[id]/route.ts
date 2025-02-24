import addressController from "@/app/_server/controllers/address.controller";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { type NextRequest } from "next/server";

export const PATCH = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    // const { data, statusCode } = await updateOne<IAddressSchema>(req, Address, [
    //   "street",
    //   "city",
    //   "state",
    //   "postalCode",
    //   "country",
    //   "phone",
    // ]);

    return await addressController.updateMyAddress(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const DELETE = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    return await addressController.deleteMyAddress(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
