import React from "react";

// JSON-LD structures are schema.org compliant objects that can be deeply nested
// Using a union type that accommodates all valid JSON values
type JsonLdData = {
  "@context"?: string;
  "@type"?: string;
  [key: string]: unknown;
};

type JsonLdProps = {
  data: JsonLdData;
};

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
