import { nextJsConfig } from "@repo/eslint-config/next-js";

export default [
  ...nextJsConfig,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Ignore generated OpenAPI client code
      "src/api/gen/**",
    ],
  },
  {
    rules: {
      // Disable prop-types for TypeScript files since we have type checking
      "react/prop-types": "off",
    },
  },
];
