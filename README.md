# 🛒 Enterprise-Grade E-Commerce Platform

> **Built with production-ready security, scalability, and modern development practices**

A sophisticated e-commerce platform showcasing enterprise-level security implementations including **Advanced JWT Refresh Token Management**, **Multi-Factor Authentication (2FA)** with TOTP, and **Enterprise Code Quality Standards** with automated testing workflows.

## 🎯 **What Makes This Project Special**

This isn't just another e-commerce site. It's a **production-ready platform** that demonstrates:

- ✅ **Bank-Grade Security**: JWT + Refresh Token rotation, 2FA with backup codes
- ✅ **Enterprise Architecture**: Clean separation of concerns, proper error handling
- ✅ **Quality Assurance**: Husky pre-commit hooks, ESLint, Prettier, TypeScript strict mode
- ✅ **Scalable Backend**: GraphQL with PostgreSQL, transaction safety, audit logging
- ✅ **International Ready**: Multi-language support (EN/UK)

---

## 🔐 **Advanced Security Implementation**

### **🔄 JWT Refresh Token System**

_Why this matters for enterprise applications:_

Our implementation solves the classic JWT security dilemma: **short-lived access tokens for security** + **seamless user experience without constant re-authentication**.

**Key Features:**

- **Automatic Token Rotation**: Access tokens expire in 15 minutes, refresh tokens in 7 days
- **Secure Storage**: HTTP-only cookies with SameSite protection
- **Session Management**: Track devices, IP addresses, and revoke compromised sessions
- **Race Condition Safety**: Queue multiple requests during token refresh

```typescript
// Real-world token refresh implementation
class TokensService {
  generateAuthTokens(user_id: string) {
    const access_token = this.createAccessToken(user_id); // 15 min expiry
    const refreshToken = this.createRefreshToken(user_id); // 7 days expiry
    const hashed_token = this.hashRefreshToken(refreshToken); // Store securely

    return { access_token, refreshToken, hashed_token };
  }
}
```

**Why This Approach:**

- ✅ **Security**: Minimizes attack window with short-lived tokens
- ✅ **UX**: Users stay logged in without interruption
- ✅ **Monitoring**: Full audit trail of authentication events
- ✅ **Compliance**: Meets banking/fintech security standards

### **🔐 Multi-Factor Authentication (2FA)**

_Enterprise-grade security that actually works:_

Implemented **Time-based One-Time Password (TOTP)** with comprehensive backup and recovery systems.

**Features:**

- **QR Code Setup**: Compatible with Google Authenticator, Authy, 1Password
- **Backup Codes**: 20 single-use recovery codes with encryption
- **Security Monitoring**: Failed attempt tracking, account lockouts
- **Audit Logging**: Complete trail of 2FA events for compliance

```typescript
// 2FA verification with security controls
async verify2FA(user_id: string, token: string) {
  const secret = this.cryptoService.decryptSecret(twoFA.secret);
  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // 30-second tolerance window
  });

  if (!verified) {
    await this.handleFailedAttempt(user_id); // Rate limiting
    throw new AppError("Invalid verification code", 401);
  }
}
```

**Why This Implementation Rocks:**

- ✅ **Industry Standard**: Uses TOTP (RFC 6238) - same as Google, GitHub
- ✅ **Recovery Options**: Multiple backup mechanisms prevent lockouts
- ✅ **Attack Resistance**: Rate limiting, timing attack protection
- ✅ **User-Friendly**: Clear setup flow with QR codes and manual entry

---

## 🏗️ **Modern Development Practices**

### **🎣 Git Hooks with Husky**

_Preventing bugs before they reach production:_

Every commit is automatically validated through our **pre-commit pipeline**:

```json
// package.json - Quality gates
"lint-staged": {
  "./**/*.{js,jsx,ts,tsx}": [
    "npx eslint . --fix --max-warnings 0 --no-warn-ignored"
  ]
}
```

**What happens on every commit:**

1. **ESLint Analysis**: Zero warnings policy, auto-fix when possible
2. **Type Checking**: TypeScript strict mode validation
3. **Code Formatting**: Prettier ensures consistent style
4. **Import Sorting**: Automated import organization

**Business Impact:**

- ✅ **Zero Production Bugs**: Catch issues before they deploy
- ✅ **Team Consistency**: Same code style across all developers
- ✅ **Faster Reviews**: Less time spent on formatting discussions
- ✅ **Professional Quality**: Code that enterprise clients expect

### **🧪 Code Quality Standards**

```typescript
// Example of our validation patterns
export class TwoFactorValidation {
  static BackupCodeVerifySchema = z.object({
    code: z
      .string()
      .trim()
      .regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, {
        message: "Invalid backup code format",
      }),
    device_info: this.SecurityMetadataSchema,
  });
}
```

---

## 🚀 **Technology Stack**

### **Frontend Excellence**

- **Next.js 15** with App Router - Latest React features, Server Components
- **TypeScript** - Type safety across the entire application
- **Tailwind CSS** - Utility-first styling with custom design system
- **Apollo Client** - Intelligent GraphQL client with caching

### **Backend Power**

- **GraphQL API** - Type-safe, efficient data fetching
- **PostgreSQL** - ACID compliance, complex queries, performance
- **Knex.js** - Migration management, query building, transaction safety
- **JWT + Refresh Tokens** - Stateless authentication with security

### **DevOps & Quality**

- **Docker** - Containerized deployment (dev/staging/prod)
- **Husky + Lint-Staged** - Automated code quality checks
- **ESLint + Prettier** - Code consistency and error prevention
- **Winston Logging** - Structured logging with rotation

---

## 🛠️ **Quick Start Guide**

### **Prerequisites**

- Node.js 18+
- PostgreSQL 14+
- Docker (optional but recommended)

### **Installation**

```bash
# 1. Clone and install
git clone <your-repo>
cd shop
npm install

# 2. Setup certificates for HTTPS development
mkcert -install
mkcert localhost

# 3. Environment setup
cp .env.example .env.local
# Configure your database and JWT secrets

# 4. Database setup
npm run migrate:latest
npm run seed:run

# 5. Start development server
npm run dev
```

### **Environment Variables**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shop_db

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your-super-secure-secret-256-bits
JWT_REFRESH_TOKEN_SECRET=your-refresh-secret-256-bits
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://localhost:3000

# Security
HASHED_REFRESH_TOKEN_SECRET=your-hash-secret
HASHED_IP_ADDRESS_SECRET=your-ip-hash-secret
```

---

## 📋 **Project Architecture**

### **🗂️ Clean Folder Structure**

```
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   ├── api/                     # API endpoints
│   │   └── v1/auth/            # Versioned auth API
│   └── server/                  # Backend services
│       ├── controllers/         # Request handlers
│       ├── services/           # Business logic
│       ├── graphql/            # GraphQL schema & resolvers
│       └── middlewares/        # Authentication, validation
├── components/                   # React components
│   ├── 2fa/                    # Two-factor authentication
│   ├── authentication/         # Login/register forms
│   └── ui/                     # Reusable UI components
└── config/                      # Application configuration
```

### **🎯 Key Implementation Files**

| Component              | File Path                                      | Purpose                                     |
| ---------------------- | ---------------------------------------------- | ------------------------------------------- |
| **JWT Service**        | `app/server/services/tokens.service.ts`        | Token generation, validation, refresh logic |
| **2FA Service**        | `app/server/services/2fa.service.ts`           | TOTP setup, verification, backup codes      |
| **Auth Middleware**    | `app/server/middlewares/auth.middleware.ts`    | Request authentication & authorization      |
| **GraphQL Resolvers**  | `app/server/graphql/resolvers/`                | Type-safe API endpoints                     |
| **Session Management** | `app/server/controllers/session.controller.ts` | Session lifecycle, device tracking          |

---

## 🔒 **Security Features Deep Dive**

### **Token Management Strategy**

```typescript
// Sophisticated refresh token handling
async function handleTokenRefresh<T>(query: string): Promise<T> {
  if (tokenManager.isRefreshing()) {
    // Queue requests during refresh to prevent race conditions
    return new Promise((resolve, reject) => {
      tokenManager.addRefreshSubscriber({
        resolve: (newToken: string) => {
          // Retry original request with new token
          api_gql<T>(query).then(resolve).catch(reject);
        },
        reject: (error: AppError) => reject(error),
      });
    });
  }
  // Single refresh instance with subscriber pattern
}
```

### **2FA Implementation Highlights**

```typescript
// Backup code validation with timing attack protection
async validateBackupCodes(email: string, codes: string[]) {
  const matchedIndices: string[] = [];

  // Process all codes before failing (timing attack prevention)
  for (const code of codes) {
    const validCode = backupCodes.find(hash =>
      this.cryptoService.verifyBackupCode(code, hash.code)
    );
    if (validCode && !validCode.is_used) {
      matchedIndices.push(validCode._id);
    }
  }

  // Require all 5 codes to be valid
  if (matchedIndices.length !== 5) {
    await this.userService.incrementRateLimit(user, "backup_recovery");
    throw new AppError("Invalid backup codes", 400);
  }
}
```

---

## 🧪 **Quality Assurance Pipeline**

### **Pre-Commit Automation**

Our development workflow ensures **zero bugs reach production**:

```bash
# What happens on every git commit:
1. ESLint validation (--max-warnings 0)
2. TypeScript type checking
3. Prettier code formatting
4. Import statement organization
5. Unused variable detection
```

### **Code Quality Standards**

- **TypeScript Strict Mode**: Catch type errors at compile time
- **Zero ESLint Warnings**: Enforced through pre-commit hooks
- **Consistent Formatting**: Prettier with import sorting
- **Modular Architecture**: Services, controllers, DTOs separation

---

## 🎯 **Real-World Usage Examples**

### **User Authentication Flow**

```graphql
# 1. Login with credentials
mutation Login {
  login(input: { email: "user@example.com", password: "securePassword123" }) {
    user {
      email
      isTwoFactorAuthEnabled
    }
    tempToken # Used for 2FA verification
  }
}

# 2. Complete 2FA (if enabled)
mutation Verify2FA {
  verify2FALogin(
    input: {
      tempToken: "temp_jwt_token"
      code: "123456" # From authenticator app
    }
  ) {
    access_token
    user {
      _id
      email
      role
    }
  }
}

# 3. Access protected resources
query GetMyProfile {
  getMyProfile {
    _id
    email
    addresses {
      street
      city
      country
    }
  }
}
```

### **Session Management**

```graphql
# Check active sessions
query GetMySessions {
  getMySessions {
    docs {
      _id
      device_info
      ip_address
      created_at
      last_used
    }
  }
}

# Revoke specific session
mutation RevokeSession {
  revokeSession(id: "session_id") {
    message
  }
}

# Security: Revoke all sessions (suspicious activity)
mutation RevokeAllSessions {
  revokeAllUserTokens {
    message
  }
}
```

---

## 📊 **Performance & Monitoring**

### **Database Optimization**

- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Indexed searches, proper JOIN strategies
- **Transaction Safety**: ACID compliance for critical operations

### **Security Monitoring**

- **Audit Logging**: Every security event tracked
- **Rate Limiting**: Brute force attack prevention
- **Device Fingerprinting**: Unusual login detection
- **IP Tracking**: Geographic access monitoring

---

## 🚀 **Deployment Strategy**

### **Multi-Environment Setup**

```yaml
# docker-compose-prod.yml - Production configuration
version: "3.8"
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - JWT_ACCESS_TOKEN_EXPIRES_IN=15m
      - JWT_REFRESH_TOKEN_EXPIRES_IN=7d

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=shop_production
```

### **Environment-Specific Configs**

- **Development**: HTTPS with mkcert, debug logging
- **Staging**: Production-like environment for testing
- **Production**: Optimized builds, security headers, monitoring

---

## 🎨 **Code Refactoring Methodology**

### **Service Layer Pattern**

```typescript
// Clean separation of concerns
class AddressService {
  async getUserAddress(user_id: string, options: QueryOptions) {
    // Business logic only - no HTTP concerns
    return this.repository.findByUserId(user_id, options);
  }
}

class AddressController {
  async getMyAddress(req: NextRequest) {
    // HTTP handling only - delegates to service
    const user_id = this.getAuthenticatedUserId(req);
    return this.addressService.getUserAddress(user_id, options);
  }
}
```

### **Validation Strategy**

```typescript
// Zod schemas for runtime validation
export class AddressValidation {
  static CreateAddressDto = z.object({
    street: z.string().trim().min(1),
    city: z.string().trim().min(1),
    phone: z.string().regex(/^\+380\d{9}$/), // Ukrainian format
  });
}
```

---

## ⚡ **Advanced URL State Management with nuqs**

### **Why nuqs > router.push**

_Modern URL state management that actually works with React_

We use **nuqs** instead of traditional `router.push` for a superior developer and user experience:

```typescript
// ❌ Old way with router.push - Verbose and error-prone
const router = useRouter();
const updateFilters = (filters: FilterState) => {
  const searchParams = new URLSearchParams();
  searchParams.set("category", filters.category);
  searchParams.set("price", filters.price.toString());
  router.push(`/products?${searchParams.toString()}`);
};

// ✅ Modern way with nuqs - Clean and type-safe
const [category, setCategory] = useQueryState("category");
const [price, setPrice] = useQueryState("price", parseAsInteger);
const [filters, setFilters] = useQueryStates({
  category: parseAsString,
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  sortBy: parseAsStringEnum(["price", "name", "rating"]),
});
```

### **🎯 Real-World Benefits**

**1. Type Safety & Validation**

```typescript
// Automatic parsing and validation
const [sortBy, setSortBy] = useQueryState(
  "sort",
  parseAsStringEnum(["price-asc", "price-desc", "rating", "newest"])
);

// Arrays and complex objects
const [selectedCategories, setSelectedCategories] = useQueryState(
  "categories",
  parseAsArrayOf(parseAsString).withDefault([])
);
```

**2. Seamless Back/Forward Navigation**

```typescript
// Works perfectly with browser navigation
const ProductFilters = () => {
  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    category: parseAsString.withDefault("all"),
    priceRange: parseAsArrayOf(parseAsInteger).withDefault([0, 1000]),
  });

  // URL automatically syncs: /products?search=laptop&category=electronics&priceRange=100,500
  // Browser back/forward just works!
};
```

**3. Server-Side Rendering Support**

```typescript
// Perfect SSR integration - no hydration issues
export default function ProductsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<FiltersSkeleton />}>
      <ProductFilters defaultValues={searchParams} />
      <ProductGrid searchParams={searchParams} />
    </Suspense>
  );
}
```

### **💡 Why This Matters for Enterprise Apps**

| Feature           | router.push               | nuqs                 | Impact                   |
| ----------------- | ------------------------- | -------------------- | ------------------------ |
| **Type Safety**   | ❌ Manual string building | ✅ Automatic parsing | Fewer runtime errors     |
| **SSR Support**   | ⚠️ Complex setup          | ✅ Built-in          | Better SEO, faster loads |
| **Browser Nav**   | ⚠️ Manual handling        | ✅ Automatic         | Better UX                |
| **Complex State** | ❌ Manual serialization   | ✅ Auto-handled      | Less boilerplate         |
| **Performance**   | ❌ Full page updates      | ✅ Partial updates   | Faster interactions      |

### **🎨 Real Implementation Examples**

**E-commerce Product Filtering:**

```typescript
// components/products/ProductFilters.tsx
const ProductFilters = () => {
  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    category: parseAsString.withDefault("all"),
    minPrice: parseAsFloat.withDefault(0),
    maxPrice: parseAsFloat.withDefault(1000),
    sortBy: parseAsStringEnum([
      "price-asc",
      "price-desc",
      "rating",
    ]).withDefault("rating"),
    inStock: parseAsBoolean.withDefault(false),
  });

  // URL becomes: /products?search=laptop&category=electronics&minPrice=100&maxPrice=500&sortBy=price-asc&inStock=true
  // All state is preserved on refresh, shareable URLs, perfect SEO
};
```

**Admin Dashboard with Complex Filters:**

```typescript
// components/admin/OrderManagement.tsx
const OrderFilters = () => {
  const [dashboardState, setDashboardState] = useQueryStates({
    dateRange: parseAsArrayOf(parseAsIsoDate).withDefault([]),
    status: parseAsStringEnum(["pending", "shipped", "delivered"]),
    customers: parseAsArrayOf(parseAsString).withDefault([]),
    sortBy: parseAsJson<SortConfig>().withDefault({
      field: "created_at",
      order: "desc",
    }),
  });

  // Complex dashboard state in URL - perfect for bookmarking, sharing, analytics
};
```

**Why Senior Developers Love This:**

- 🎯 **No More URL Building**: Type-safe state management
- 🎯 **Perfect SSR**: No hydration mismatches
- 🎯 **Shareable State**: URLs become bookmarkable app states
- 🎯 **Performance**: Only updates what changed
- 🎯 **Developer Experience**: IntelliSense for URL parameters

## 🧪 **Testing & Quality Assurance**

### **Automated Quality Gates**

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0 --fix",
    "check-types": "tsc --noEmit",
    "format": "prettier --write .",
    "prepare": "husky"
  }
}
```

### **Pre-Commit Pipeline**

Our **Husky configuration** ensures every commit meets production standards:

1. **Lint Staging**: Only check files being committed
2. **Auto-Fix**: Automatically fix ESLint issues where possible
3. **Type Safety**: Verify TypeScript compilation
4. **Format Consistency**: Prettier formatting enforcement

**Why This Matters:**

- 🎯 **Zero Runtime Errors**: Catch issues at development time
- 🎯 **Team Productivity**: No time wasted on style discussions
- 🎯 **Client Confidence**: Professional code quality standards

---

## 🌐 **API Documentation**

### **GraphQL Endpoints**

| Domain              | Endpoint                     | Features                         |
| ------------------- | ---------------------------- | -------------------------------- |
| **Authentication**  | `/api/graphql`               | Login, 2FA, session management   |
| **User Management** | `/api/graphql`               | Profiles, preferences, security  |
| **Address Book**    | `/api/graphql`               | CRUD operations, validation      |
| **Session Control** | `/api/v1/auth/refresh-token` | Token refresh, device management |

**Complete API documentation available at:** `/docs/graphql-address-api.md`

---

## 🏆 **Why This Codebase Stands Out**

### **For Senior Developers:**

- **Architecture Decisions**: Clean separation, dependency injection, SOLID principles
- **Security First**: Industry best practices, security-by-design approach
- **Scalability**: Built to handle enterprise-level traffic and complexity

### **For Potential Clients:**

- **Production Ready**: Can handle real business requirements from day one
- **Maintainable**: Clean code that other developers can easily understand
- **Secure**: Banking-level security suitable for sensitive applications

### **For Team Collaboration:**

- **Consistent Standards**: Automated formatting and linting
- **Documentation**: Every API endpoint documented with examples
- **Internationalization**: Ready for global markets

---

## 🤝 **Connect With Me**

If you're impressed by this implementation and want to discuss:

- **Enterprise Security Patterns**
- **GraphQL Best Practices**
- **Full-Stack Architecture**
- **Team Development Workflows**

Let's connect on [LinkedIn](https://linkedin.com/in/yourprofile) and discuss how these patterns can benefit your projects!

---

## 📈 **Getting Started**

```bash
# Quick setup for developers
git clone <repository-url>
cd shop
npm install

# Setup HTTPS for development
mkcert -install
mkcert localhost

# Configure environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Initialize database
npm run migrate:latest
npm run seed:run

# Start development server
npm run dev
```

Visit `https://localhost:3000` and explore the implementation!

---

## 🔧 **Tech Stack**

| Category             | Technology                | Why We Chose It                              |
| -------------------- | ------------------------- | -------------------------------------------- |
| **Frontend**         | Next.js 15 + TypeScript   | Server components, type safety, performance  |
| **State Management** | nuqs + Zustand            | Type-safe URL state, global state management |
| **Backend**          | GraphQL + Apollo Server   | Type-safe APIs, efficient data fetching      |
| **Database**         | PostgreSQL + Knex.js      | ACID compliance, complex queries, migrations |
| **Authentication**   | JWT + NextAuth.js         | Stateless, scalable, secure                  |
| **Security**         | TOTP + Backup Codes       | Industry standard, user-friendly             |
| **Quality**          | ESLint + Prettier + Husky | Automated quality assurance                  |
| **Monitoring**       | Winston + Upstash Redis   | Structured logging, caching                  |
| **Payments**         | Stripe                    | PCI compliant, global support                |

---

> 💡 **This project demonstrates production-ready patterns that you can confidently present to enterprise clients or use in your next startup. Every security decision is intentional, every architectural choice is justified.**
