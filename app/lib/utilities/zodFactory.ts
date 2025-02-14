import { z } from "zod";
import { lang } from "@/app/lib/utilities/lang";

type TranslationsStructure = Record<
  string,
  Record<string, Record<string, string>>
>;

export function createNamespacedSchema<T extends z.ZodRawShape>(
  namespace: string,
  translations: TranslationsStructure,
  schemaDefinition: T
) {
  const schema = z.object(schemaDefinition);
  const originalParse = schema.parse.bind(schema);

  const parseWithNamespace = (data: unknown) => {
    try {
      return originalParse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        (error as any).namespace = namespace;
      }
      throw error;
    }
  };

  return Object.assign(schema, { parse: parseWithNamespace });
}
