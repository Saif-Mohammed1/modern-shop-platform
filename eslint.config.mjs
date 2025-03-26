// import eslintJS from "@eslint/js";
// const { compat } = eslintJS;
// export default [
//   {
//     ignores: ["node_modules"],
//   },
//   // Extend the recommended configurations
//   ...compat.extends(
//     "eslint:recommended",
//     "plugin:@typescript-eslint/recommended",
//     "plugin:react/recommended",
//     "plugin:react-hooks/recommended",
//     "next/core-web-vitals"
//   ),
//   {
//     files: ["**/*.ts", "**/*.tsx"],
//     languageOptions: {
//       parser: "@typescript-eslint/parser",
//     },
//     plugins: {
//       "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
//       react: require("eslint-plugin-react"),
//       "react-hooks": require("eslint-plugin-react-hooks"),
//     },
//     rules: {
//       "@typescript-eslint/no-unused-vars": [
//         "warn",
//         { argsIgnorePattern: "^_" }, // Ignore unused args starting with _
//       ],
//       "react/react-in-jsx-scope": "off", // Not needed in Next.js
//       "react/prop-types": "off", // TypeScript removes the need for PropTypes
//     },
//   },
// ];
// .eslintrc.js (or .eslintrc.cjs for CommonJS)
import eslintJS from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsdocPlugin from "eslint-plugin-jsdoc";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.Config} */
export default [
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "build",
      "*.config.js",
      "**/*.d.ts",
    ],
  },
  eslintJS.configs.recommended,
  {
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
      jsdoc: jsdocPlugin,
      import: importPlugin,
    },
    languageOptions: {
      parser: typescriptPlugin.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-curly-brace-presence": ["error", "never"],
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    rules: {
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
    },
  },
  {
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
];
