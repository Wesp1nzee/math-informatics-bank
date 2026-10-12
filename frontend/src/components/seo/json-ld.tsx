import type { JsonLdObject } from "@/lib/seo/json-ld";

/**
 * Renders structured data. `<` is escaped so a value can never terminate the
 * script element early.
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
