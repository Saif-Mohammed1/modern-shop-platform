// eslint.config.mjs
import eslintJS from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import jsdocPlugin from "eslint-plugin-jsdoc";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import validateJSXNestingPlugin from "eslint-plugin-validate-jsx-nesting";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('eslint').Linter.Config} */
export default [
  // Base ignores and recommended configs
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "build",
      "*.config.js",
      "**/*.d.ts",
      "**/**test**/**",
      "**/__tests__/**",
      "**/__test__/**",
    ],
  },
  eslintJS.configs.recommended,

  // Shared configuration for all files
  {
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
      jsdoc: jsdocPlugin,
      import: importPlugin,
      "jsx-a11y": jsxA11yPlugin,
      "validate-jsx-nesting": validateJSXNestingPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["tsconfig.json"],
        tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: true,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
      },
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },

  // Shared rules for all JS/TS files
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react/no-danger-with-children": "error",
      "react/jsx-no-duplicate-props": "warn",
      "react/jsx-curly-brace-presence": ["error", "never"],
      "react/no-unknown-property": ["error", { ignore: ["css"] }],
      // "react/jsx-no-bind": ["warn", { allowArrowFunctions: true }],
      "react/jsx-no-bind": [
        "error",
        {
          allowArrowFunctions: true, // Disallow arrow functions in JSX props
          allowBind: false, // Disallow .bind() (not relevant here, but good practice)
          ignoreRefs: true, // Ignore ref callbacks
          ignoreDOMComponents: false, // Apply to DOM elements like <button>
        },
      ],
      "react/jsx-no-leaked-render": [
        "error",
        {
          validStrategies: ["ternary", "coerce"],
        },
      ],

      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-has-content": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/heading-has-content": "warn",
      "jsx-a11y/no-aria-hidden-on-focusable": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/no-static-element-interactions": [
        "error",
        {
          handlers: ["onClick", "onKeyPress", "onKeyDown", "onKeyUp"],
        },
      ],
      "jsx-a11y/click-events-have-key-events": "warn",
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
          pathGroups: [
            { pattern: "@/**", group: "internal" },
            { pattern: "@server/**", group: "internal" },
            { pattern: "@components/**", group: "internal" },
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
      "@next/next/no-page-custom-font": "warn",
      "validate-jsx-nesting/no-invalid-jsx-nesting": "error",
    },
  },

  // TypeScript-specific rules
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: true,
            arguments: true,
            properties: true,
          },
        },
      ],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },

  // JavaScript-specific rules
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/no-unescaped-entities": "warn",
      "react/no-children-prop": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
    },
  },
];
