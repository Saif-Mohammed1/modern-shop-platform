import { z } from "zod";

declare module "zod" {
  interface ZodType<
    Output = any,
    Def extends z.ZodTypeDef = z.ZodTypeDef,
    Input = Output,
  > {
    meta(metadata: Record<string, unknown>): this;
  }
}
