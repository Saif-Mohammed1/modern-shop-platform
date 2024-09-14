import AppError from "@/components/util/appError";

export const getFav = async (req, model, popOptions) => {
  try {
    const doc = await model
      .find({ user: { $eq: req.user._id } })
      .select("product -_id ")
      .populate(popOptions);
    return {
      // data: doc,
      data: doc,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const createFav = async (req, model) => {
  let doc;
  try {
    doc = await model.create({
      user: req.user._id,
      product: req.id,
    });
    return {
      // data: doc,
      data: doc,
      statusCode: 201,
    };
  } catch (error) {
    if (doc) {
      await model.findOneAndDelete(
        { product: req.id, user: req.user._id } // Condition to find the document
      );
      throw error;
    }
  }
};
export const deleteFav = async (req, model) => {
  try {
    const doc = await model.findOneAndDelete(
      { product: req.id, user: req.user._id } // Condition to find the document
    );
    if (!doc) {
      throw new AppError("No documents found with", 404);
    }
    return {
      // data: doc,
      data: null,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
