// src/app/lib/schemas/security.schemas.ts
import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";
import { lang } from "@/app/lib/utilities/lang";
import { TwoFactorTranslate } from "@/public/locales/server/TwoFactor.Translate";
import { userZodValidatorTranslate } from "@/public/locales/server/userControllerTranslate";
import { z, type IpVersion } from "zod";

export class TwoFactorValidation {
  private static allowedEmailDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
  ];
  static TwoFactorLoginSchema = z.object({
    tempToken: z
      .string({
        message: TwoFactorTranslate[lang].dto.temToken.required,
      })
      .min(1, TwoFactorTranslate[lang].dto.temToken.required),
    code: z
      .string({
        message: TwoFactorTranslate[lang].dto.code.required,
      })
      .length(6, TwoFactorTranslate[lang].dto.code.regex),
    // TOTP code

    // code: z.union([
    //   z
    //     .string({
    //       message: TwoFactorTranslate[lang].dto.code.required,
    //     })
    //     .length(6), // TOTP code
    //   z.string().regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, {
    //     message: TwoFactorTranslate[lang].dto.code.regex,
    //   }), // Backup code
    // ]),
  });
  static validateTwoFactorLogin(data: any) {
    return this.TwoFactorLoginSchema.parse(data);
  }
  static SecurityMetadataSchema = z.object({
    ipAddress: z
      .string({
        message: TwoFactorTranslate[lang].dto.ipAddress.required,
      })
      .ip({
        version: "v4" as IpVersion,
        message: TwoFactorTranslate[lang].dto.ipAddress.invalid,
      }),
    userAgent: z
      .string({
        message: TwoFactorTranslate[lang].dto.userAgent.required,
      })
      .min(1, TwoFactorTranslate[lang].dto.userAgent.required),
    location: z
      .object({
        country: z.string().optional(),
        region: z.string().optional(),
        city: z.string().optional(),
        timezone: z.string().optional(),
      })
      .optional(),
    deviceHash: z
      .string()
      .min(64, TwoFactorTranslate[lang].dto.deviceHash.invalid),
    deviceType: z
      .enum(["desktop", "mobile", "tablet", "bot", "unknown"])
      .default("unknown"),
    browser: z
      .object({
        name: z.string().optional(),
        version: z.string().optional(),
        major: z.string().optional(),
      })
      .optional(),
    os: z
      .object({
        name: z.string().optional(),
        version: z.string().optional(),
      })
      .optional(),
    isp: z.string().optional(),
    asn: z.string().optional(),
    fingerprint: z.string().optional(),
  });

  static TwoFactorInitSchema = z.object({
    userId: zObjectId,
  });

  static TwoFactorVerifySchema = z.object({
    token: z
      .string({
        message: TwoFactorTranslate[lang].dto.temToken.required,
      })
      .length(6),
    // deviceInfo: this.SecurityMetadataSchema,
  });

  static BackupCodeVerifySchema = z.object({
    code: z
      .string({
        message: TwoFactorTranslate[lang].dto.code.required,
      })
      .regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, {
        message: TwoFactorTranslate[lang].dto.code.regex,
      }),
    deviceInfo: this.SecurityMetadataSchema,
  });

  static TwoFactorDisableSchema = z.object({
    // verificationMethod: z.enum(["password", "backup_code"]),
    code: z.string({
      message: TwoFactorTranslate[lang].dto.code.required,
    }),

    // password: z.string().optional(),
  });

  static TwoFactorAuditLogSchema = z.object({
    action: z.enum([
      "2FA_INIT",
      "2FA_SUCCESS",
      "2FA_FAILED_ATTEMPT",
      "BACKUP_CODE_USED",
      "2FA_DISABLED",
      "BACKUP_CODE_REGENERATED",
    ]),
    metadata: this.SecurityMetadataSchema,
    timestamp: z.date(),
  });

  static BackupCodeValidationSchema = z.object({
    codes: z
      .array(
        z.string({
          message: TwoFactorTranslate[lang].dto.backupCode.backUp,
        })
      )
      .length(5, {
        message: TwoFactorTranslate[lang].dto.backupCode.array,
      }),
    email: z
      .string({
        required_error: userZodValidatorTranslate[lang].email.required,
      })
      .email(userZodValidatorTranslate[lang].email.invalid)
      .refine((email) => {
        const domain = email.split("@")[1];
        return this.allowedEmailDomains.includes(domain);
      }, userZodValidatorTranslate[lang].email.domainNotAllowed),
  });
  static validateSecurityMetadata(data: any) {
    return this.SecurityMetadataSchema.parse(data);
  }
}

export type SecurityMetadataType = z.infer<
  typeof TwoFactorValidation.SecurityMetadataSchema
>;
// /**// src/app/lib/utilities/security.ts
// import { UAParser } from 'ua-parser-js';
// import { SecurityMetadata } from "@/app/lib/features/2fa/2fa.interface";

// export function collectSecurityMetadata(req: NextRequest): SecurityMetadata {
//   const ipAddress = getClientIP(req);
//   const userAgent = req.headers.get('user-agent') || 'unknown';
//   const parser = new UAParser(userAgent);

//   return {
//     ipAddress,
//     userAgent,
//     deviceHash: createDeviceHash(ipAddress, userAgent),
//     deviceType: getDeviceType(parser),
//     browser: parser.getBrowser(),
//     os: parser.getOS(),
//     location: getGeoLocation(ipAddress),
//     isp: getISP(ipAddress),
//     asn: getASN(ipAddress)
//   };
// }

// function createDeviceHash(ip: string, ua: string): string {
//   return crypto
//     .createHash('sha256')
//     .update(`${ip}-${ua}`)
//     .digest('hex');
// } */
