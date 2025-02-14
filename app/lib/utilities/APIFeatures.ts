import { Query, FilterQuery } from "mongoose";

class APIFeatures<
  T extends {
    category?: string;
  },
> {
  //  new APIFeatures(
  //     Model.find(),
  //     req.nextUrl.searchParams
  //     //  req.query // == undefined
  //   )

  query: Query<T[], T>;
  page?: number;
  limit?: number;
  searchParams: URLSearchParams;
  queryString: Record<string, any>;
  constructor(query: Query<T[], T>, searchParams: URLSearchParams) {
    this.query = query;
    this.page = 1; // default to page 1
    this.limit = 15; // default to 15 items per page
    this.searchParams = searchParams;
    this.queryString = this.parseSearchParams();
  }

  parseSearchParams(): Record<string, any> {
    let query: Record<string, any> = {};

    if (this.searchParams) {
      for (const [key, value] of this.searchParams) {
        if (value && value !== "undefined") {
          // Check if the key is a range query (e.g., 'price[gte]')
          const isRangeQuery = key.includes("[") && key.endsWith("]");

          if (isRangeQuery) {
            // Extract the operator and field name from the key
            const operator = key.substring(
              key.indexOf("[") + 1,
              key.indexOf("]")
            );
            const field = key.substring(0, key.indexOf("["));

            // Handle range queries (e.g., 'price[gte]')
            if (!query[field]) {
              query[field] = {};
            }

            // Convert the range query to appropriate Mongoose query format
            query[field][`$${operator}`] = value;
          } else {
            // Handle regular queries (e.g., 'cost')
            query[key] = value;
          }
        }
      }
    }
    return query;
  }
  filter(): this {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "category"];
    // excludedFields.forEach((el) => delete queryObj[el]);
    excludedFields.forEach((el) => delete queryObj[el]);
    // Check if name or email is provided in the query parameters
    if (queryObj.name) {
      // Use regular expression to match name
      queryObj.name = { $regex: queryObj.name.trim(), $options: "i" };
    }
    if (queryObj.email) {
      // Use regular expression to match email
      queryObj.email = { $regex: queryObj.email.trim(), $options: "i" };
    }

    if (queryObj.date) {
      const startDate = new Date(queryObj.date.trim());
      const endDate = new Date(); // Current date

      queryObj.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
      delete queryObj.date; // Remove the original date parameter
    }

    if (queryObj.rating) {
      const rating = queryObj.rating * 1;
      if (rating <= 1) {
        queryObj.ratingsAverage = { $gte: 0, $lte: 1.9 };
      } else if (rating < 5) {
        const maxRating = rating + 0.9;
        queryObj.ratingsAverage = { $gte: rating, $lte: maxRating };
      } else {
        queryObj.ratingsAverage = { $gte: rating };
      }
      delete queryObj.rating;
    }
    this.query = this.query.find(
      //JSON.parse(queryStr)
      queryObj
    );
    this.page = this.queryString.page * 1 || 1;
    this.limit = this.queryString.limit * 1 || 15;
    return this;
  }
  category(): this {
    if (this.queryString.category) {
      let fields: string[] = this.queryString.category.split(",");
      fields = fields.filter((item: string) => item !== "all");
      if (fields.length >= 1) {
        // Create a regular expression for the category values
        const categoryRegex = fields.map(
          (category: string) => new RegExp(category, "i")
        );
        // Use the $in operator with the regular expression array
        const query: FilterQuery<T> = { category: { $in: categoryRegex } };
        this.query = this.query.find(query);
      }
    }
    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate(): this {
    this.page = this.page && this.page > 0 ? this.page : 1;
    this.limit = this.limit && this.limit > 0 ? this.limit : 15;
    const skip = (this.page * 1 - 1) * this.limit;
    this.query = this.query.skip(skip).limit(this.limit);

    return this;
  }
}
export default APIFeatures;
