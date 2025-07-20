import { gql } from "@apollo/client";

export const CHECK_REVIEW_QUERY = gql`
  query CheckReview($product_id: String!) {
    checkReview(product_id: $product_id) {
      exists
    }
  }
`;

export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      _id
      user_id
      user_name
      product_id {
        name
        slug
      }
      rating
      comment
      created_at
    }
  }
`;
