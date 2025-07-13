import { type IpVersion, z } from "zod";

import { AuditSource } from "@/app/lib/types/audit.db.types";
import { lang } from "@/app/lib/utilities/lang";
import { ProductTranslate } from "@/public/locales/server/Product.Translate";

export class LogsValidation {
  static LogsSchema = z.object({
    ipAddress: z
      .string({
        required_error: ProductTranslate[lang].dto.ipAddress.required,
      })
      .ip({
        version: "v4" as IpVersion,
        message: ProductTranslate[lang].dto.ipAddress.invalid,
      }),
    userAgent: z
      .string({
        required_error: ProductTranslate[lang].dto.userAgent.required,
      })
      .min(1, ProductTranslate[lang].dto.userAgent.required),
    source: z
      .enum(Object.values(AuditSource) as [string, ...string[]])
      .default(AuditSource.WEB)
      .optional(),
  });
  static validateLogs = (data: z.infer<typeof this.LogsSchema>) => {
    return this.LogsSchema.parse(data);
  };
}
export type LogsTypeDto = z.infer<typeof LogsValidation.LogsSchema>;
