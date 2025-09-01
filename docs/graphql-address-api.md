# 📍 Address Management API Documentation

## Overview

The Address Management API provides comprehensive functionality for managing user addresses in the e-commerce platform. This API supports creating, reading, updating, and deleting user addresses with proper authentication and validation.

## 🔐 Authentication

**All operations require authentication.** Include a valid JWT token in your request headers:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Types and Schemas

### Core Types

#### `AddressType`

Represents a user address in the system.

| Field         | Type     | Description                                  |
| ------------- | -------- | -------------------------------------------- |
| `_id`         | `String` | Unique identifier for the address            |
| `street`      | `String` | Street address including house number        |
| `city`        | `String` | City name                                    |
| `state`       | `String` | State or province                            |
| `postal_code` | `String` | ZIP/postal code                              |
| `phone`       | `String` | Contact phone number (format: +380XXXXXXXXX) |
| `country`     | `String` | Country name                                 |
| `user_id`     | `String` | ID of the address owner                      |
| `created_at`  | `String` | Address creation timestamp                   |

#### `AddressTypeResult`

Paginated result for address queries.

| Field   | Type              | Description                     |
| ------- | ----------------- | ------------------------------- |
| `docs`  | `[AddressType!]!` | Array of address objects        |
| `meta`  | `PaginationMeta!` | Pagination metadata             |
| `links` | `Links`           | Navigation links for pagination |

#### `PaginationMeta`

Pagination information for paginated responses.

| Field        | Type       | Description                     |
| ------------ | ---------- | ------------------------------- |
| `total`      | `Int!`     | Total number of addresses       |
| `page`       | `Int!`     | Current page number             |
| `limit`      | `Int!`     | Number of items per page        |
| `totalPages` | `Int!`     | Total number of pages           |
| `hasNext`    | `Boolean!` | Whether there's a next page     |
| `hasPrev`    | `Boolean!` | Whether there's a previous page |

### Input Types

#### `CreateAddressInput`

Input for creating a new address.

| Field         | Type      | Required | Description                           |
| ------------- | --------- | -------- | ------------------------------------- |
| `street`      | `String!` | ✅       | Street address including house number |
| `city`        | `String!` | ✅       | City name                             |
| `state`       | `String!` | ✅       | State or province                     |
| `postal_code` | `String!` | ✅       | ZIP/postal code                       |
| `phone`       | `String!` | ✅       | Phone number (format: +380XXXXXXXXX)  |
| `country`     | `String!` | ✅       | Country name                          |

#### `UpdateAddressInput`

Input for updating an existing address.

| Field         | Type     | Required | Description                           |
| ------------- | -------- | -------- | ------------------------------------- |
| `street`      | `String` | ❌       | Street address including house number |
| `city`        | `String` | ❌       | City name                             |
| `state`       | `String` | ❌       | State or province                     |
| `postal_code` | `String` | ❌       | ZIP/postal code                       |
| `phone`       | `String` | ❌       | Phone number (format: +380XXXXXXXXX)  |
| `country`     | `String` | ❌       | Country name                          |

#### `Filter`

Pagination filter for queries.

| Field   | Type  | Required | Description              | Default |
| ------- | ----- | -------- | ------------------------ | ------- |
| `page`  | `Int` | ❌       | Page number to retrieve  | 1       |
| `limit` | `Int` | ❌       | Number of items per page | 10      |

## 🔍 Queries

### `getMyAddress`

Retrieves all addresses belonging to the authenticated user with pagination support.

**Signature:**

```graphql
getMyAddress(filter: Filter): AddressTypeResult!
```

**Arguments:**

- `filter` (optional): Pagination parameters

**Example Request:**

```graphql
query GetMyAddresses {
  getMyAddress(filter: { page: 1, limit: 5 }) {
    docs {
      _id
      street
      city
      state
      postal_code
      phone
      country
      created_at
    }
    meta {
      total
      page
      limit
      totalPages
      hasNext
      hasPrev
    }
    links {
      first
      prev
      next
      last
    }
  }
}
```

**Example Response:**

```json
{
  "data": {
    "getMyAddress": {
      "docs": [
        {
          "_id": "64a8f2b8c1d2e3f4a5b6c7d8",
          "street": "123 Main Street",
          "city": "Kyiv",
          "state": "Kyiv Oblast",
          "postal_code": "01001",
          "phone": "+380123456789",
          "country": "Ukraine",
          "created_at": "2024-07-15T10:30:00Z"
        }
      ],
      "meta": {
        "total": 3,
        "page": 1,
        "limit": 5,
        "totalPages": 1,
        "hasNext": false,
        "hasPrev": false
      },
      "links": {
        "first": "/addresses?page=1&limit=5",
        "prev": null,
        "next": null,
        "last": "/addresses?page=1&limit=5"
      }
    }
  }
}
```

## ✏️ Mutations

### `addAddress`

Creates a new address for the authenticated user.

**Signature:**

```graphql
addAddress(input: CreateAddressInput!): AddressType!
```

**Arguments:**

- `input`: Address data to create

**Example Request:**

```graphql
mutation CreateAddress {
  addAddress(
    input: {
      street: "456 Oak Avenue"
      city: "Lviv"
      state: "Lviv Oblast"
      postal_code: "79000"
      phone: "+380987654321"
      country: "Ukraine"
    }
  ) {
    _id
    street
    city
    state
    postal_code
    phone
    country
    created_at
  }
}
```

**Example Response:**

```json
{
  "data": {
    "addAddress": {
      "_id": "64a8f2b8c1d2e3f4a5b6c7d9",
      "street": "456 Oak Avenue",
      "city": "Lviv",
      "state": "Lviv Oblast",
      "postal_code": "79000",
      "phone": "+380987654321",
      "country": "Ukraine",
      "created_at": "2024-07-15T11:45:00Z"
    }
  }
}
```

### `updateMyAddress`

Updates an existing address belonging to the authenticated user.

**Signature:**

```graphql
updateMyAddress(id: String!, input: UpdateAddressInput!): AddressType!
```

**Arguments:**

- `id`: The address ID to update
- `input`: Fields to update (only provided fields will be updated)

**Example Request:**

```graphql
mutation UpdateAddress {
  updateMyAddress(
    id: "64a8f2b8c1d2e3f4a5b6c7d9"
    input: { street: "789 Pine Street", phone: "+380111222333" }
  ) {
    _id
    street
    city
    state
    postal_code
    phone
    country
    created_at
  }
}
```

**Example Response:**

```json
{
  "data": {
    "updateMyAddress": {
      "_id": "64a8f2b8c1d2e3f4a5b6c7d9",
      "street": "789 Pine Street",
      "city": "Lviv",
      "state": "Lviv Oblast",
      "postal_code": "79000",
      "phone": "+380111222333",
      "country": "Ukraine",
      "created_at": "2024-07-15T11:45:00Z"
    }
  }
}
```

### `deleteMyAddress`

Deletes an address belonging to the authenticated user.

**Signature:**

```graphql
deleteMyAddress(id: String!): responseWithMessage!
```

**Arguments:**

- `id`: The address ID to delete

**Example Request:**

```graphql
mutation DeleteAddress {
  deleteMyAddress(id: "64a8f2b8c1d2e3f4a5b6c7d9") {
    message
  }
}
```

**Example Response:**

```json
{
  "data": {
    "deleteMyAddress": {
      "message": "Address deleted successfully"
    }
  }
}
```

## 🚨 Error Handling

### Common Errors

#### Authentication Errors

```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

#### Validation Errors

```json
{
  "errors": [
    {
      "message": "Phone number must follow format +380XXXXXXXXX",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "field": "phone"
      }
    }
  ]
}
```

#### Not Found Errors

```json
{
  "errors": [
    {
      "message": "Address not found or doesn't belong to user",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

#### Invalid ID Format

```json
{
  "errors": [
    {
      "message": "Invalid ID format",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "field": "id"
      }
    }
  ]
}
```

### Field-Specific Validation Rules

| Field         | Validation Rules                                             |
| ------------- | ------------------------------------------------------------ |
| `phone`       | Must match pattern `+380XXXXXXXXX` (Ukrainian phone numbers) |
| `street`      | Required, minimum 1 character after trim                     |
| `city`        | Required, minimum 1 character after trim                     |
| `state`       | Required, minimum 1 character after trim                     |
| `postal_code` | Required, minimum 1 character after trim                     |
| `country`     | Required, minimum 1 character after trim                     |

## 🚀 Getting Started

### 1. Authentication Setup

Before using any address operations, ensure you have:

- A valid user account
- A JWT token obtained through the authentication API

### 2. Basic Usage Flow

```graphql
# 1. First, get existing addresses
query {
  getMyAddress {
    docs {
      _id
      street
      city
      country
    }
    meta {
      total
    }
  }
}

# 2. Create a new address
mutation {
  addAddress(
    input: {
      street: "123 Main St"
      city: "Kyiv"
      state: "Kyiv Oblast"
      postal_code: "01001"
      phone: "+380123456789"
      country: "Ukraine"
    }
  ) {
    _id
    street
    city
  }
}

# 3. Update if needed
mutation {
  updateMyAddress(id: "your-address-id", input: { phone: "+380987654321" }) {
    _id
    phone
  }
}
```

### 3. Pagination Best Practices

- Default page size is usually 10 items
- For mobile apps, consider using smaller page sizes (5-10)
- For admin dashboards, larger page sizes (20-50) might be appropriate
- Always check `hasNext` before requesting the next page

```graphql
query GetAddressesWithPagination {
  getMyAddress(filter: { page: 1, limit: 10 }) {
    docs { /* ... fields ... */ }
    meta {
      hasNext
      hasPrev
      totalPages
    }
  }
}
```

## 📋 Best Practices

### 1. Error Handling

Always implement proper error handling in your client code:

```javascript
try {
  const result = await client.mutate({
    mutation: ADD_ADDRESS,
    variables: { input: addressData },
  });
} catch (error) {
  if (error.graphQLErrors.length > 0) {
    // Handle GraphQL errors (validation, etc.)
    console.error("GraphQL Error:", error.graphQLErrors[0].message);
  } else if (error.networkError) {
    // Handle network errors
    console.error("Network Error:", error.networkError);
  }
}
```

### 2. Efficient Querying

Only request the fields you need:

```graphql
# ✅ Good - only request needed fields
query {
  getMyAddress {
    docs {
      _id
      street
      city
    }
  }
}

# ❌ Avoid - requesting all fields unnecessarily
query {
  getMyAddress {
    docs {
      _id
      street
      city
      state
      postal_code
      phone
      country
      user_id
      created_at
    }
  }
}
```

### 3. Caching Strategy

- Use Apollo Client's cache for address data
- Invalidate cache after mutations
- Consider using `refetchQueries` for critical updates

### 4. User Experience

- Validate phone numbers on the client side before submission
- Provide clear error messages for validation failures
- Implement optimistic updates for better perceived performance

## 🔗 Related APIs

- **User API**: For user authentication and profile management
- **Order API**: Addresses are used during checkout process
- **Cart API**: Shipping addresses for cart calculations

## 📞 Support

For technical questions or issues with the Address API, please:

1. Check this documentation first
2. Review the error messages and validation rules
3. Contact the development team with specific error details and reproduction steps
