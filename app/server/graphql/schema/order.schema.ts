export const ordersTypeDefs = /* GraphQL */ `
  scalar JSON

  type Shipping_address {
    street: String!
    city: String!
    state: String!
    postal_code: String!
    phone: String!
    country: String!
  }

  input Shipping_addressInput {
    street: String!
    city: String!
    state: String!
    postal_code: String!
    phone: String!
    country: String!
  }

  type Dimensions {
    length: Float!
    width: Float!
    height: Float!
  }

  input DimensionsInput {
    length: Float!
    width: Float!
    height: Float!
  }

  # type Shipping_info {
  #   weight: Float!
  #   dimensions: Dimensions!
  # }

  input Shipping_infoInput {
    weight: Float!
    dimensions: DimensionsInput!
  }

  type OrderItems {
    product_id: String!
    name: String!
    price: Float!
    discount: Float!
    quantity: Int!
    sku: String!
    shipping_info_weight: Float!
    shipping_info_dimensions: Dimensions!
    final_price: Float!
    attributes: JSON
  }

  input OrderItemsInput {
    product_id: String!
    name: String!
    price: Float!
    discount: Float!
    quantity: Int!
    sku: String!
    shipping_info: Shipping_infoInput!
    final_price: Float!
    attributes: JSON
  }

  type Payment {
    method: String!
    transaction_id: String!
  }

  input PaymentInput {
    method: String!
    transaction_id: String!
  }
  type User_info {
    name: String!
    email: String!
  }
  type Order {
    _id: ID!
    status: String!
    user_id: String!
    user_info: User_info!
    shipping_address: Shipping_address!
    items: [OrderItems!]!
    currency: String!
    invoice_id: String!
    invoice_link: String!
    total: Float!
    subtotal: Float!
    tax: Float!
    payment: Payment!
    order_notes: [String!]
    cancellation_reason: String
    created_at: String!
  }

  input CreateOrderInput {
    status: String!
    user_id: String!
    shipping_address: Shipping_addressInput!
    items: [OrderItemsInput!]!
    currency: String!
    invoice_id: String!
    invoice_link: String!
    total: Float!
    subtotal: Float!
    tax: Float!
    payment: PaymentInput!
    order_notes: [String!]
    cancellation_reason: String
  }
  type OrderResult {
    docs: [Order!]!
    meta: PaginationMeta
    links: Links
  }
  input OrderFilter {
    page: Int
    limit: Int
  }
  input UpdateOrderInput {
    status: String
    user_id: String
    shipping_address: Shipping_addressInput
    items: [OrderItemsInput!]
    currency: String
    invoice_id: String
    invoice_link: String
    total: Float
    subtotal: Float
    tax: Float
    payment: PaymentInput
    order_notes: [String!]
    cancellation_reason: String
  }

  input AdminOrderFilter {
    email: String
    status: String
    startDate: String
    endDate: String
    sort: String
    page: Int
    limit: Int
  }

  input CheckoutSessionInput {
    shipping_info: Shipping_addressInput!
  }

  type CheckoutSessionResponse {
    url: String!
  }

  type Query {
    getOrders(filter: OrderFilter): OrderResult!
    getOrderById(id: String!): Order!
    getOrdersByUserId(filter: OrderFilter): OrderResult!
    getOrdersByAdmin(filter: OrderFilter): OrderResult!
    getLatestOrder: Order!
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: String!, status: String!): Order!
    updateOrder(id: String!, input: CreateOrderInput!): Order!
    deleteOrder(id: String!): responseWithMessage!
    createCheckoutSession(
      input: CheckoutSessionInput!
    ): CheckoutSessionResponse!
  }
`;
