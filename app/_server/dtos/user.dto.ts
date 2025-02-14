// import { lang } from "@/app/lib/util/lang";
import { lang } from "@/app/lib/utilities/lang";
import { userZodValidatorTranslate } from "@/public/locales/server/userControllerTranslate";
import { z } from "zod";
export class UserValidation {
  // Allowed email domains (Modify as needed)
  private static allowedEmailDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
  ];
  // Schema for creating a user
  static userCreateSchema = z
    .object({
      name: z
        .string({
          required_error: userZodValidatorTranslate[lang].name.required,
        })
        .min(3, userZodValidatorTranslate[lang].name.minLength)
        .max(50, userZodValidatorTranslate[lang].name.maxLength),
      email: z
        .string({
          required_error: userZodValidatorTranslate[lang].email.required,
        })
        .email(userZodValidatorTranslate[lang].email.invalid)
        .refine((email) => {
          const domain = email.split("@")[1];
          return this.allowedEmailDomains.includes(domain);
        }, userZodValidatorTranslate[lang].email.domainNotAllowed),
      phone: z
        .string()
        .regex(
          /^\+?[1-9]\d{1,14}$/,
          userZodValidatorTranslate[lang].phone.invalid
        ) // Supports E.164 format
        .optional(),
      password: z
        .string({
          required_error: userZodValidatorTranslate[lang].password.required,
        })
        .min(10, userZodValidatorTranslate[lang].password.minLength)
        .max(40, userZodValidatorTranslate[lang].password.maxLength)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
          userZodValidatorTranslate[lang].password.invalid
        ),
      confirmPassword: z.string({
        required_error:
          userZodValidatorTranslate[lang].confirmPassword.required,
      }),
      role: z.enum(["customer", "admin", "moderator"]).default("customer"),
      preferences: z
        .object({
          language: z.enum(["en", "uk", "es", "fr", "de"]).default("uk"),
          currency: z.enum(["USD", "EUR", "GBP", "UAH"]).default("UAH"),
          marketingOptIn: z.boolean().default(false),
        })
        .optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: userZodValidatorTranslate[lang].confirmPassword.invalid,
      path: ["confirmPassword"],
    });

  // Schema for login validation (debuggable)
  static loginSchema = z.object({
    email: z
      .string({
        required_error: userZodValidatorTranslate[lang].email.required,
      })
      .email(userZodValidatorTranslate[lang].email.invalid)
      .refine((email) => {
        const domain = email.split("@")[1];
        return this.allowedEmailDomains.includes(domain);
      }, userZodValidatorTranslate[lang].email.domainNotAllowed),
    password: z
      .string({
        required_error: userZodValidatorTranslate[lang].password.required,
      })
      .min(10, userZodValidatorTranslate[lang].password.invalid), // Generic message for security
  });
  static changePasswordSchema = z
    .object({
      currentPassword: z.string({
        required_error:
          userZodValidatorTranslate[lang].currentPassword.required,
      }),
      newPassword: z
        .string({
          required_error: userZodValidatorTranslate[lang].password.required,
        })
        .min(10, userZodValidatorTranslate[lang].password.minLength)
        .max(40, userZodValidatorTranslate[lang].password.maxLength)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
          userZodValidatorTranslate[lang].password.invalid
        ),
      confirmPassword: z.string({
        required_error:
          userZodValidatorTranslate[lang].confirmPassword.required,
      }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: userZodValidatorTranslate[lang].confirmPassword.invalid,
      path: ["confirmPassword"],
    });
  static passwordResetSchema = z.object({
    token: z.string({
      required_error: userZodValidatorTranslate[lang].token.required,
    }),
    password: z
      .string({
        required_error: userZodValidatorTranslate[lang].password.required,
      })
      .min(10, userZodValidatorTranslate[lang].password.minLength)
      .max(40, userZodValidatorTranslate[lang].password.maxLength)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        userZodValidatorTranslate[lang].password.invalid
      ),
    // confirmPassword: z.string({
    //   required_error: userZodValidatorTranslate[lang].confirmPassword.required,
    // }),
  });
  /** Validate User Creation */
  static validateUserCreateDTO(data: any) {
    return this.userCreateSchema.parse(data);
    // const result = this.userCreateSchema.safeParse(data);
    // if (!result.success) {
    //   return { success: false, errors: result.error.format() };
    // }
    // return { success: true, data: result.data };
  }

  /** Validate Login (Returns structured error instead of throwing) */
  static validateLogin(data: any) {
    return this.loginSchema.parse(data);
    // const result = this.loginSchema.safeParse(data);
    // if (!result.success) {
    //   return { success: false, errors: result.error.format() };
    // }
    // // return { success: true, data: result.data };
  }

  /** Validate Email */
  static isEmail(email: string) {
    return z

      .string({
        required_error: userZodValidatorTranslate[lang].email.required,
      })
      .email(userZodValidatorTranslate[lang].email.invalid)
      .refine((email) => {
        const domain = email.split("@")[1];
        return this.allowedEmailDomains.includes(domain);
      }, userZodValidatorTranslate[lang].email.domainNotAllowed)

      .parse(email);
  }
  // Santize any + chr from email
  // static sanitizeEmail(email: string) {
  //   return email
  //     .trim() // Remove spaces
  //     .normalize("NFC") // Normalize Unicode characters
  //     .replace(/\.(?=.*@gmail\.com)/g, "") // Remove dots for Gmail
  //     .replace(/\+.*(?=@)/g, "") // Remove anything after `+`
  //     .toLowerCase(); // Convert to lowercase
  // }
  static sanitizeEmail(email: string) {
    let [localPart, domain] = email.trim().toLowerCase().split("@");

    // Remove non-alphanumeric characters except dots (only inside the local part)
    localPart = localPart.replace(/[^a-z0-9.]/g, "");

    // Ensure no leading/trailing dots and no consecutive dots
    localPart = localPart.replace(/^\.+|\.+$/g, "").replace(/\.{2,}/g, ".");

    return `${localPart}@${domain}`;
  }

  /** Validate Phone */
  static isPhone(phone: string) {
    return z
      .string()
      .regex(
        /^\+?[1-9]\d{1,14}$/,
        userZodValidatorTranslate[lang].phone.invalid
      )
      .parse(phone);
  }

  static validateChangePassword(data: any) {
    return this.changePasswordSchema.parse(data);
  }

  static validatePasswordReset(data: any) {
    return this.passwordResetSchema.parse(data);
  }
  static validateEmailAndToken(data: any) {
    return z
      .object({
        email: z
          .string({
            required_error: userZodValidatorTranslate[lang].email.required,
          })
          .email(userZodValidatorTranslate[lang].email.invalid)
          .refine((email) => {
            const domain = email.split("@")[1];
            return this.allowedEmailDomains.includes(domain);
          }, userZodValidatorTranslate[lang].email.domainNotAllowed),
        token: z.string({
          required_error: userZodValidatorTranslate[lang].token.required,
        }),
      })
      .parse(data);
  }
}

// Export Types
export type UserCreateDTO = z.infer<typeof UserValidation.userCreateSchema>;
export type UserLoginDTO = z.infer<typeof UserValidation.loginSchema>;
export type UserChangePasswordDTO = z.infer<
  typeof UserValidation.changePasswordSchema
>;
