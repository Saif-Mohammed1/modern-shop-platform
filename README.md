License: MIT

# 🛍️ Modern E-Commerce Platform

A production-ready, full-stack e-commerce application built with Next.js 15, GraphQL, and PostgreSQL. This project showcases enterprise-level architecture with advanced security features, real-time capabilities, and a scalable microservice-inspired structure.

![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![GraphQL](https://img.shields.io/badge/GraphQL-16.11-E10098?logo=graphql)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-316192?logo=postgresql)
![Apollo](https://img.shields.io/badge/Apollo-4.12-311C87?logo=apollo-graphql)

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Security Features](#-security-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Management](#-database-management)
- [API Documentation](#-api-documentation)
- [Development](#-development)

## ✨ Key Features

### 🔐 Advanced Security

- **Two-Factor Authentication (2FA)**: TOTP-based authentication with QR code generation using Speakeasy
- **JWT with Refresh Tokens**: Secure token-based authentication with automatic token refresh
- **Rate Limiting**: Intelligent rate limiting with Redis for auth, API, GraphQL, and critical operations
- **Session Management**: Device tracking, suspicious activity detection, and multi-session support
- **Security Audit Logs**: Comprehensive logging of all security-related events
- **Password Encryption**: Bcrypt-based password hashing with salt rounds

### 🎯 E-Commerce Features

- Product catalog with advanced filtering and search
- Shopping cart with real-time updates
- Wishlist functionality
- Order management system
- Review and rating system
- Multi-address support
- Refund and return processing
- Stripe payment integration

### 📊 Admin Dashboard

- User management with security analytics
- Product management (CRUD operations)
- Order tracking and fulfillment
- Revenue analytics and reporting
- Security monitoring dashboard
- Device management per user

### 🚀 Performance & Scalability

- Server-side rendering (SSR) with Next.js 15
- GraphQL API with Apollo Server
- Redis caching for rate limiting and sessions
- Database query optimization with Knex.js
- Image optimization with Sharp and Cloudinary
- Response compression and caching headers

## 🏗️ Architecture

This project follows a clean, layered architecture inspired by Domain-Driven Design (DDD) and microservices patterns:

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│         (Next.js App Router + React 19)                  │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    API Gateway Layer                     │
│              (GraphQL + Apollo Server)                   │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   Middleware Layer                       │
│        (Auth, Rate Limiting, Error Handling)            │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   Controller Layer                       │
│          (Request Validation & Response)                 │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│              (Business Logic & Orchestration)            │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   Repository Layer                       │
│            (Data Access & Query Building)                │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    Database Layer                        │
│              (PostgreSQL + Knex.js ORM)                  │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### **Controller Layer** (`app/server/controllers/`)

- Request validation using Zod schemas
- Input sanitization and transformation
- Response formatting
- Error handling and HTTP status codes
- GraphQL resolver coordination

#### **Service Layer** (`app/server/services/`)

- Core business logic implementation
- Transaction management
- Cross-domain orchestration
- External API integration (Stripe, Cloudinary, Email)
- Security operations (2FA, token management)

#### **Repository Layer** (`app/server/repositories/`)

- Database query construction
- Data mapping and transformation
- Query optimization
- Base repository pattern for code reuse
- Complex joins and aggregations

#### **GraphQL Layer** (`app/server/graphql/`)

- Schema definitions (Type-safe GraphQL schemas)
- Resolvers implementation
- Custom scalar types (DateTime, EmailAddress)
- Query optimization with DataLoader pattern
- Error formatting and handling

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS 4.0 with PostCSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Apollo Client (GraphQL)
- **Animations**: Framer Motion, Lottie React
- **UI Components**: Headless UI, Swiper
- **Notifications**: React Hot Toast

### Backend

- **Runtime**: Node.js with TypeScript
- **GraphQL Server**: Apollo Server 4
- **Database ORM**: Knex.js
- **Database**: PostgreSQL
- **Caching**: Redis (Upstash)
- **Authentication**: NextAuth.js + JWT
- **Security**:
  - Speakeasy (2FA/TOTP)
  - Bcrypt (Password hashing)
  - Rate limiting (Custom Redis-based)
- **Payment**: Stripe
- **Email**: Nodemailer
- **File Upload**: Cloudinary
- **Logging**: Winston with daily log rotation
- **Validation**: Zod

### DevOps & Tools

- **Containerization**: Docker + Docker Compose
- **Code Quality**: ESLint, Prettier
- **Git Hooks**: Husky + Lint-staged
- **SSL Certificates**: mkcert (local development)
- **Type Checking**: TypeScript strict mode

## 📁 Project Structure

```
shop/
├── app/
│   ├── (auth)/                      # Protected auth routes
│   │   ├── (admin)/                 # Admin dashboard
│   │   ├── account/                 # User account management
│   │   ├── checkout/                # Checkout process
│   │   └── verify-email/            # Email verification
│   ├── (public)/                    # Public routes
│   │   ├── shop/                    # Product listings
│   │   ├── auth/                    # Login/Register
│   │   └── about-us/                # Static pages
│   ├── api/v1/                      # REST API endpoints (if any)
│   ├── lib/
│   │   ├── actions/                 # Server actions
│   │   ├── config/                  # Configuration files
│   │   ├── graphql/                 # Client GraphQL queries
│   │   ├── types/                   # TypeScript types
│   │   └── utilities/               # Helper functions
│   └── server/
│       ├── controllers/             # Request handlers
│       ├── services/                # Business logic
│       │   ├── 2fa.service.ts
│       │   ├── tokens.service.ts
│       │   ├── user.service.ts
│       │   ├── security.service.ts
│       │   ├── stripe.service.ts
│       │   └── ...
│       ├── repositories/            # Data access layer
│       │   ├── BaseRepository.ts
│       │   ├── user.repository.ts
│       │   ├── product.repository.ts
│       │   └── ...
│       ├── graphql/
│       │   ├── schema/              # GraphQL type definitions
│       │   ├── resolvers/           # GraphQL resolvers
│       │   └── apollo-server.ts     # Apollo Server setup
│       ├── middlewares/
│       │   ├── auth.middleware.ts
│       │   ├── security.middleware.ts
│       │   └── error.middleware.ts
│       ├── validators/              # Zod validation schemas
│       ├── dtos/                    # Data Transfer Objects
│       ├── db/
│       │   ├── migrations/          # Database migrations
│       │   └── seeds/               # Database seeds
│       └── utils/                   # Server utilities
├── components/                      # React components
│   ├── 2fa/                         # 2FA UI components
│   ├── authentication/              # Auth forms
│   ├── (admin)/dashboard/           # Admin components
│   ├── customers/                   # Customer dashboard
│   └── ...
├── public/
│   ├── locales/                     # i18n translations
│   └── ...
├── @types/                          # TypeScript declarations
├── certificates/                    # SSL certificates (dev)
├── docker-compose.yml               # Docker configuration
├── knexfile.ts                      # Knex configuration
├── middleware.ts                    # Next.js middleware
└── tsconfig.json                    # TypeScript config
```

## 🔒 Security Features

### 1. Two-Factor Authentication (2FA)

```typescript
// Located in: app/server/services/2fa.service.ts
- QR Code generation for authenticator apps
- Backup codes (8 codes, single-use)
- TOTP verification with 30-second window
- Device trust management
- Audit logging for 2FA events
```

### 2. Rate Limiting Strategy

```typescript
// Located in: app/lib/utilities/rate-limiter.ts
Rate Limit Configurations:
- Auth endpoints: 10 requests per 5 minutes
- API endpoints: 30 requests per minute
- GraphQL: 20 queries per minute
- Critical operations: 5 attempts per hour

Features:
- Redis-based atomic operations (Lua scripts)
- Per-user and per-IP tracking
- Automatic TTL management
- Custom headers (X-RateLimit-*)
```

### 3. JWT & Refresh Token System

```typescript
// Located in: app/server/services/tokens.service.ts
Access Token:
- Short-lived (15 minutes)
- Contains user ID, email, role
- Used for API authentication

Refresh Token:
- Long-lived (7 days)
- Stored in HTTP-only cookies
- Automatic rotation on refresh
- Device-bound tokens
- Revocation support
```

### 4. Session Management

```typescript
// Located in: app/server/services/session.service.ts
Features:
- Device fingerprinting
- IP address tracking
- Geographic location detection
- Suspicious activity alerts
- Session termination (single/all devices)
- Last activity tracking
```

### 5. Security Middleware

```typescript
// Located in: app/server/middlewares/security.middleware.ts
- CSRF protection
- XSS prevention
- SQL injection protection
- Request sanitization
- Security headers (HSTS, CSP, etc.)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (or Upstash account)
- Stripe account (for payments)
- Cloudinary account (for images)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Saif-Mohammed1/modern-shop-platform.git
cd modern-shop-platform
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up SSL certificates for local development**

```bash
mkcert -install
mkcert localhost
```

4. **Configure environment variables**

```bash
cp .env.example .env
# Edit .env with your configurations
```

5. **Set up the database**

```bash
# Run migrations
npm run migrate:latest

# Seed the database (optional)
npm run seed:run
```

6. **Start development server**

```bash
npm run dev
```

The application will be available at `https://localhost:3000`

### Using Docker

```bash
# Development
docker-compose -f docker-compose-dev.yml up

# Production
docker-compose -f docker-compose-prod.yml up
```

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shop_db"
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=shop_db

# Redis (Upstash or local)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET=sk_test_your_stripe_secret
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourstore.com

# Logging
LOG_LEVEL=debug
LOGTAIL_SOURCE_TOKEN=your_logtail_token

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=https://localhost:3000
```

## 🗄️ Database Management

### Migrations

```bash
# Create a new migration
npm run migrate:make migration_name

# Run pending migrations
npm run migrate:latest

# Rollback last migration
npm run migrate:rollback

# Run migration script
npm run migrate
```

### Seeds

```bash
# Create a new seed file
npm run seed:make seed_name

# Run all seeds
npm run seed:run
```

### Database Schema Overview

```sql
Key Tables:
- users (with 2FA fields)
- sessions (device tracking)
- refresh_tokens
- products
- categories
- orders
- order_items
- cart
- reviews
- addresses
- wishlists
- audit_logs
- security_events
```

## 📡 API Documentation

### GraphQL Endpoint

```
Development: https://localhost:3000/api/graphql
Production: https://your-domain.com/api/graphql
```

### GraphQL Playground

Access the interactive GraphQL playground at:

```
https://localhost:3000/api/graphql
```

### Key GraphQL Queries

#### Authentication

```graphql
mutation Login($email: EmailAddress!, $password: String!) {
  login(email: $email, password: $password) {
    user {
      id
      email
      firstName
      lastName
      role
    }
    requires2FA
    message
  }
}

mutation Verify2FA($token: String!) {
  verify2FA(token: $token) {
    success
    message
  }
}
```

#### User Management

```graphql
query GetCurrentUser {
  currentUser {
    id
    email
    firstName
    lastName
    role
    twoFactorEnabled
    emailVerified
  }
}

query GetUserSessions {
  userSessions {
    id
    deviceInfo
    ipAddress
    location
    lastActivity
    isCurrent
  }
}
```

#### Products

```graphql
query GetProducts($page: Int, $limit: Int, $category: String) {
  products(page: $page, limit: $limit, category: $category) {
    products {
      id
      name
      description
      price
      images
      stock
      category
      rating
    }
    totalPages
    currentPage
  }
}
```

#### Cart & Orders

```graphql
mutation AddToCart($productId: ID!, $quantity: Int!) {
  addToCart(productId: $productId, quantity: $quantity) {
    id
    items {
      product {
        id
        name
        price
      }
      quantity
    }
    total
  }
}

mutation CreateOrder($shippingAddressId: ID!, $paymentMethod: String!) {
  createOrder(
    shippingAddressId: $shippingAddressId
    paymentMethod: $paymentMethod
  ) {
    id
    orderNumber
    total
    status
  }
}
```

### Rate Limit Headers

All API responses include rate limit information:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1699564800
```

## 💻 Development

### Code Quality

```bash
# Run ESLint
npm run lint

# Type checking
npm run check-types

# Format code
npm run format

# Check formatting
npm run format:check
```

### Pre-commit Hooks

This project uses Husky and lint-staged to ensure code quality:

- Automatic ESLint fixes on staged files
- Type checking before commit
- Prettier formatting

### Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true npm run build
```

## 📊 Monitoring & Logging

### Winston Logger

- Structured JSON logging
- Daily log rotation
- Multiple log levels (error, warn, info, debug)
- Logtail integration for production

### Log Locations

```
logs/
├── error/           # Error logs
├── combined/        # All logs
└── exceptions/      # Uncaught exceptions
```

### Audit Logs

All security-sensitive operations are logged:

- Login attempts
- 2FA verifications
- Password changes
- Session terminations
- Admin actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Saif Mohammed** - [GitHub](https://github.com/Saif-Mohammed1)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Apollo GraphQL for the robust GraphQL implementation
- Vercel for deployment platform
- All open-source contributors

---

**Note**: This is a production-ready template showcasing enterprise-level patterns and security best practices. Feel free to use it as a foundation for your e-commerce projects.

For questions or support, please open an issue on GitHub.
