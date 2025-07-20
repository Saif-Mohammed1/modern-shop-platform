import { z } from "zod";

import { OrderStatus } from "@/app/lib/types/orders.db.types";
import { UserRole } from "@/app/lib/types/users.db.types";

// Define proper TypeScript interfaces
export interface AdminOrderFilter {
  email?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: number;
  limit?: number;
  active?: boolean; // Made optional to match the schema
}

export interface SearchParams {
  category?: string;
  name?: string;
  search?: string;
  sort?: string;
  fields?: string;
  rating?: number;
  role?: UserRole; // Made optional to match the schema
  actor?: string;
  action?: string;
}

// Combined filter interface
export interface GlobalFilter extends AdminOrderFilter, SearchParams {}

// Define allowed values for better security

const ALLOWED_STATUS_VALUES = [
  "active",
  "inactive",
  "suspended",
  "deleted",
  "pending",
  "completed",
  "cancelled",
] as const;

export class GlobalFilterValidator {
  // UUID validation schema
  private static readonly uuidSchema = z.string().uuid("Invalid UUID format");

  // ID validation schema (can be UUID or MongoDB ObjectId)
  private static readonly idSchema = z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
      "Invalid ID format - must be UUID or MongoDB ObjectId"
    );

  private static readonly filterSchema = z
    .object({
      // Email validation with flexible format - allows partial emails, names, or full emails
      email: z
        .string()
        .regex(
          /^[a-zA-Z0-9._-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?$/,
          "Invalid email format - can be partial email, name, or full email"
        )
        .optional(),

      // Status with allowed values
      status: z
        .enum([...ALLOWED_STATUS_VALUES, ...Object.values(OrderStatus)])
        .optional(),

      // Date validation with ISO format
      startDate: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/,
          "Invalid date format"
        )
        .optional(),
      endDate: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/,
          "Invalid date format"
        )
        .optional(),

      // Sort validation with field:order format
      sort: z
        .string()
        .regex(
          /^(name|email|createdAt|updatedAt|rating|price):(asc|desc)$/,
          "Sort must be in format 'field:order'"
        )
        .optional(),

      // Pagination with numeric validation
      page: z
        .number()
        .int("Page must be an integer")
        .min(1, "Page must be greater than 0")
        .optional(),
      limit: z
        .number()
        .int("Limit must be an integer")
        .min(1, "Limit must be greater than 0")
        .max(100, "Limit must be 100 or less")
        .optional(),

      // Search parameters
      category: z
        .string()
        .min(1, "Category cannot be empty")
        .max(50, "Category too long")
        .optional(),
      name: z
        .string()
        .min(1, "Name cannot be empty")
        .max(100, "Name too long")
        .optional(),
      search: z
        .string()
        .min(1, "Search term cannot be empty")
        .max(100, "Search term too long")
        .optional(),
      fields: z
        .string()
        .regex(/^[\w,]+$/, "Fields must be comma-separated valid field names")
        .optional(),
      rating: z
        .number()
        .min(0, "Rating cannot be negative")
        .max(5, "Rating cannot exceed 5")
        .optional(),
      role: z
        .enum([UserRole.CUSTOMER, UserRole.ADMIN, UserRole.MODERATOR])
        .optional(),
      active: z.boolean().optional(),
      actor: z
        .string()
        // .regex(/^[a-zA-Z0-9_-]+$/, "Actor must be alphanumeric with underscores or dashes")
        .optional(),
      action: z
        .string()
        // .regex(/^[a-zA-Z0-9_-]+$/, "Action must be alphanumeric with underscores or dashes")
        .optional(),
    })
    .refine(
      (data) => {
        // Custom validation: startDate should be before endDate
        if (data.startDate && data.endDate) {
          const start = new Date(data.startDate);
          const end = new Date(data.endDate);
          return start <= end;
        }
        return true;
      },
      {
        message: "Start date must be before or equal to end date",
        path: ["endDate"],
      }
    );

  /**
   * Validates UUID format using parse (throws on error)
   * @param uuid - The UUID string to validate
   * @returns The validated UUID string
   */
  static validateUUID(uuid: string): string {
    return this.uuidSchema.parse(uuid);
  }

  /**
   * Validates ID format (UUID or MongoDB ObjectId) using parse (throws on error)
   * @param id - The ID string to validate
   * @returns The validated ID string
   */
  static validateId(id: string): string {
    return this.idSchema.parse(id);
  }

  /**
   * Validates filter data with comprehensive error handling
   * @param filter - The filter object to validate
   * @returns Validation result with parsed data or errors
   */
  static validate(filter: any): GlobalFilter {
    return this.filterSchema.parse(filter);
  }
}
