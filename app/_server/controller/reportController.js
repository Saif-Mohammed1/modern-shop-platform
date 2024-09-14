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
export const createReport = async (req, model) => {
  try {
    const { issue, message } = await req.json();

    const doc = await model.create({
      user: req.user._id,
      name: req.user?.name,
      product: req.id,
      issue,
      message,
    });
    return {
      // data: doc,
      data: doc,
      statusCode: 201,
    };
  } catch (error) {
    throw error;
  }
};
export const deleteFav = async (req, model) => {
  try {
    const doc = await model.findOneAndDelete(
      { product: req.id, user: req.user._id } // Condition to find the document
    );
    return {
      // data: doc,
      data: null,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
