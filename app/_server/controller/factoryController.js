import APIFeatures from "@/components/util/APIFeatures";
import AppError from "@/components/util/appError";
// import { uploadImage } from "@/components/util/cloudinary";
// import { NextResponse } from "next/server";

export const createOne = async (req, Model) => {
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
export const deleteOne = async (req, Model) => {
  try {
    const doc = await Model.findByIdAndDelete(req.id);

    if (!doc) {
      // return NextResponse.json(
      //   { message: "No document found with that ID" },
      //   { status: 404 }
      // );
      throw new AppError("No document found with that ID", 404);
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

    // ////console.log("err", error);
    // return NextResponse.json({ ...error });
  }
};

export const updateOne = async (req, Model, allowedFields = []) => {
  try {
    const data = await req.json();

    const updateData = {};

    if (allowedFields.length === 0) {
      throw new AppError("No valid fields provided for update", 400);
    }

    Object.keys(data).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = data[key];
      }
    });

    // Check if updateData is empty
    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid fields provided for update", 400);
    }

    const doc = await Model.findByIdAndUpdate(req.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      throw new AppError("No document found with that ID", 404);
    }

    return { data: doc, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};
export const getOne = async (req, Model, popOptions) => {
  try {
    let query = Model.findById(req.id);
    if (popOptions) query = query.populate(popOptions);
    let doc = await query;

    if (!doc || doc?.user === null) {
      throw new AppError("No document found with that ID", 404);
    }
    return { data: doc, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};
export const getAggregate = async (
  req,
  Model,
  popOptions = {
    filterField: "createdAt",
    filterValue: "",
    regexOptions: "i",
  }
) => {
  try {
    let { page, limit, sort, filterField, filterValue, regexOptions } =
      popOptions;
    // Parse page and limit to integers and handle NaN cases
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 8;

    const skip = (page - 1) * limit;

    const matchFilter = {};
    if (filterValue) {
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
        { $limit: limit },
      ]), // Add exec() to trigger middleware
    ]);

    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].total : 0;
    const pageCount = Math.ceil(totalCount / limit);

    return { data: paginatedResult, statusCode: 200, pageCount };
  } catch (error) {
    ////console.log("error", error);
    throw error;
  }
};

export const getAll = async (
  req,
  Model,
  popOptions,
  enablePagination = true
) => {
  try {
    const features =
      // .paginate()
      new APIFeatures(
        Model.find(),
        req.nextUrl.searchParams
        //  req.query // == undefined
      )
        .filter()
        .category()
        .sort()
        .limitFields();

    if (popOptions) features.query = features.query.populate(popOptions);

    let doc = await features.query;
    // ////console.log("doc product 1S", doc);
    ////console.log("doc product 1S", doc.length);
    const allData = doc;

    const pageCount = Math.ceil(doc.length / features.limit);

    if (enablePagination) {
      doc = await features.paginate().query.clone();
    }

    if (!doc) {
      throw new AppError("No documents found with", 404);
    }
    return {
      allData,
      data: doc,
      pageCount,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const getAllWithoutLimit = async (req, Model, popOptions) => {
  let doc;
  try {
    if (Model.modelName == "User") {
      doc = await Model.find().select("+active");
    } else {
      if (popOptions) {
        doc = await Model.find().populate(popOptions);
      } else {
        doc = await Model.find();
      }
    }

    if (!doc) {
      throw new AppError("No documents found with", 404);
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

export const getUniqueCategories = async (model) => {
  try {
    const categories = await model.distinct("category");
    return {
      categories,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const getDataByUser = async (req, Model, popOptions) => {
  try {
    let doc = Model.find({ user: req.user._id });
    if (popOptions) doc = doc.populate(popOptions);

    const data = await doc;

    return { data, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};

export const updatePaymentStatus = async (req, Model) => {
  try {
    let { status } = await req.json();
    if (!status) {
      throw new AppError("invalid action", 400);
    }

    const doc = await Model.findByIdAndUpdate(
      req.id,
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
