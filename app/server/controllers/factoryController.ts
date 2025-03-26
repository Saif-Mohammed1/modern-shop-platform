import APIFeatures from "@/app/lib/utilities/APIFeatures";
import AppError from "@/app/lib/utilities/appError";
import { Document, Model } from "mongoose";
import type { NextRequest } from "next/server";
import type { UserAuthType } from "@/app/lib/types/users.types";
import { factoryControllerTranslate } from "../../../public/locales/server/factoryControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
// import { uploadImage } from "@/components/util/cloudinary";
// import { NextResponse } from "next/server";
interface BaseDocument extends Document {
  category?: string; // Optional property
}
type PopOptions = {
  path: string;
  select?: string;
  page?: string;
  limit?: string;
  sort?: string;
  // filterField?: string;
  filterValue?: string;
  filterField?: string;
  regexOptions?: "i" | "eq";
};
export const createOne = async <T extends Document>(
  req: NextRequest,
  Model: Model<T>
) => {
  const { user } = req;
  let doc;
  try {
    let data = await req.json();

    if (user) data = { ...data, user };
    doc = await Model.create(data);

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
export const deleteOne = async <T extends Document>(
  req: NextRequest,
  Model: Model<T>
) => {
  try {
    const doc = await Model.findByIdAndDelete(req.id);

    if (!doc) {
      // return NextResponse.json(
      //   { message: "No document found with that ID" },
      //   { status: 404 }
      // );
      throw new AppError(
        factoryControllerTranslate[lang].errors.noDocumentsFoundWithId,
        404
      );
    }

    // return NextResponse.json(
    //   {
    //     data: null,
    //   },
    //   { status: 204 }
    // );
    return {
      data: null,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};

export const updateOne = async <T extends Document>(
  req: NextRequest,
  Model: Model<T>,
  allowedFields: string[]
) => {
  try {
    const data = await req.json();

    const updateData: Partial<T> = {};

    if (allowedFields.length === 0) {
      throw new AppError(
        factoryControllerTranslate[
          lang
        ].controllers.updateOne.noValidFieldsProvidedForUpdate,
        400
      );
    }

    Object.keys(data).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key as keyof T] = data[key];
      }
    });

    // Check if updateData is empty
    if (Object.keys(updateData).length === 0) {
      throw new AppError(
        factoryControllerTranslate[
          lang
        ].controllers.updateOne.noValidFieldsProvidedForUpdate,
        400
      );
    }

    const doc = await Model.findByIdAndUpdate(req.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      throw new AppError(
        factoryControllerTranslate[lang].errors.noDocumentsFoundWithId,
        404
      );
    }

    return { data: doc, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};

export const getOne = async <T extends Document>(
  req: NextRequest,
  Model: Model<T>,
  popOptions?: PopOptions
) => {
  //popOptions ={path: 'user', select: 'name email'}
  try {
    let query = Model.findById(req.id).lean();
    if (popOptions) query = query.populate(popOptions);
    let doc = await query;

    if (!doc || ("user" in doc && doc.user === null)) {
      throw new AppError(
        factoryControllerTranslate[lang].errors.noDocumentsFoundWithId,
        404
      );
    }
    return { data: doc, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};
export const getAggregate = async <T extends Document>(
  // req: NextRequest,
  Model: Model<T>,
  popOptions?: PopOptions
) => {
  try {
    const {
      page = "1",
      limit = "15",
      sort = "createdAt",
      filterField,
      filterValue,
      regexOptions,
    } = popOptions || {};

    // Parse page and limit to integers and handle NaN cases
    const currentPage = parseInt(page, 10);
    const currentLimit = parseInt(limit, 10);

    const skip = (currentPage - 1) * currentLimit;

    const matchFilter: Record<string, any> = {}; // Changed to any to accommodate both regex and equality conditions
    if (filterValue && filterField) {
      matchFilter[filterField] = {};

      if (regexOptions === "i") {
        // If regexOptions is 'i', use $regex for case-insensitive match
        matchFilter[filterField].$regex = filterValue;
        matchFilter[filterField].$options = "i";
      } else {
        // If regexOptions is not 'i', use $eq for equality match
        matchFilter[filterField].$eq = filterValue;
      }
    }
    // Use the Model's aggregation method
    const [totalCountResult, paginatedResult] = await Promise.all([
      Model.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        { $match: matchFilter },

        {
          $count: "total",
        },
      ]), // Add exec() to trigger middleware
      Model.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        { $match: matchFilter },
        { $sort: { [sort]: 1 } }, // Default sorting by createdAt
        { $skip: skip },
        { $limit: currentLimit },
      ]), // Add exec() to trigger middleware
    ]);

    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].total : 0;
    const pageCount = Math.ceil(totalCount / currentLimit);

    return { data: paginatedResult, statusCode: 200, pageCount };
  } catch (error) {
    throw error;
  }
};

export const getAll = async <T extends BaseDocument>(
  req: NextRequest,
  Model: Model<T>,
  popOptions?: PopOptions,
  enablePagination = true
) => {
  try {
    const features =
      // .paginate()
      new APIFeatures<T>(
        Model.find(),
        req.nextUrl.searchParams
        //  req.query // == undefined
      )
        .filter()
        .category()
        .sort()
        .limitFields();

    if (popOptions) features.query = features.query.populate(popOptions);

    let doc = await features.query.lean();

    // const allData = doc;
    const limit = features.limit ?? 15;
    const pageCount = Math.ceil(doc.length / limit);

    if (enablePagination) {
      doc = await features.paginate().query.clone().lean();
    }

    if (!doc) {
      throw new AppError(
        factoryControllerTranslate[lang].errors.noDocumentsFound,
        404
      );
    }
    return {
      // allData,
      data: doc,
      pageCount,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const getAllWithoutLimit = async <T extends Document>(
  // req: NextRequest,
  Model: Model<T>,
  popOptions?: PopOptions
) => {
  let doc;
  try {
    if (Model.modelName == "User") {
      doc = Model.find().select("+active").lean();
    } else {
      if (popOptions) {
        doc = Model.find().populate(popOptions).lean();
      } else {
        doc = Model.find().lean();
      }
    }
    await doc;
    if (!doc) {
      throw new AppError(
        factoryControllerTranslate[lang].errors.noDocumentsFound,
        404
      );
    }

    return {
      // data: doc,
      data: doc,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};

export const getDataByUser = async <
  T extends Document & {
    user: UserAuthType["_id"];
  },
>(
  req: NextRequest,
  Model: Model<T>,
  popOptions?: PopOptions
) => {
  try {
    const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    const page = searchParams.get("page") ?? "1";
    const limit = 3;
    const currentPage = parseInt(page, 10);
    const skip = (currentPage - 1) * limit;
    // if (!req.id) {
    //   throw new AppError("Invalid product id", 400);
    // }
    let load = Model.find({ user: req.user?._id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    if (popOptions) load = load.populate(popOptions);
    const [doc, totalCount] = await Promise.all([
      load,
      Model.countDocuments({ user: req.user?._id }),
    ]);
    const hasNextPage = totalCount > currentPage * limit;

    // let doc = Model.find({ user: req.user?._id });
    // if (popOptions) doc = doc.populate(popOptions);

    // const data = await doc;

    return { data: doc, hasNextPage, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};

// export const updatePaymentStatus = async <T extends Document>(req:NextRequest, Model:Model<T>,) => {
//   try {
//     let { status } = await req.json();
//     if (!status) {
//       throw new AppError("invalid action", 400);
//     }

//     const doc = await Model.findByIdAndUpdate(
//       req.id,
//       { status },
//       { new: true, runValidators: true }
//     );

//     return {
//       data: doc,
//       statusCode: 200,
//     };
//   } catch (error) {
//     throw error;
//   }
// };
