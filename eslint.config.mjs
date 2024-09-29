import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Get current file path for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize FlatCompat and pass the recommended configurations
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {
    rules: {
      // Add rules that are part of the recommended configuration
      "no-unused-vars": "warn",
      "no-extra-semi": "error",
      "no-debugger": "warn",
      // You can add more recommended rules here
    },
  },
});

export default [
  {
    ignores: ["node_modules"],
  },
  // Extend the recommended configurations
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "next/core-web-vitals"
  ),
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      react: require("eslint-plugin-react"),
      "react-hooks": require("eslint-plugin-react-hooks"),
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" }, // Ignore unused args starting with _
      ],
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/prop-types": "off", // TypeScript removes the need for PropTypes
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
  },
];
