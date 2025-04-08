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
// import customeRule from "./eslint-plugin-no-void-jsx/dist/index.js";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
// - "no-duplicate-case": "error",
// - "no-invalid-regexp": "error",
// - "no-irregular-whitespace": "error",
// - "no-sparse-arrays": "error",
// - "no-unreachable": "error",
// - "no-unsafe-negation": "error",
// - "no-undef": "error",
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
      //ignore any file contain .old.*
      "**/*.old.*",
      "config"
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
      // "event-handlers": customeRule,

      // "no-void-jsx": saveEventHandelPlugin,
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
      "no-console": "warn",
      "no-debugger": "warn",
      "no-alert": "warn",
      "no-duplicate-imports": "error",
      "no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      "no-throw-literal": "error",
      "no-useless-catch": "error",
      "no-useless-return": "error",
      "no-unsafe-optional-chaining": "error",
      "no-unused-private-class-members": "error",
      "no-empty-pattern": "error",
      "no-misleading-character-class": "error",
      "no-new-symbol": "error",
      "no-setter-return": "error",
      "no-template-curly-in-string": "error",
      "no-unreachable-loop": "error",
      "no-unused-labels": "error",
      "no-unused-vars": [
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
      "no-use-before-define": [
        "error",
        {
          functions: false,
          classes: false,
          variables: true,
        },
      ],
      "no-var": "error",
      "no-eval": "error",
      "no-else-return": "error",
      "no-empty": [
        "error",
        {
          allowEmptyCatch: true,
        },
      ],
      eqeqeq: [
        "error",
        "always",
        {
          null: "ignore",
        },
      ],
      curly: ["error", "all"],
      "prefer-template": "error",
      "prefer-spread": "error",
      "prefer-rest-params": "error",
      "prefer-destructuring": [
        "error",
        {
          array: false,
          object: true,
        },
        {
          enforceForRenamedProperties: false,
        },
      ],
      "prefer-arrow-callback": [
        "error",
        {
          allowNamedFunctions: false,
          allowUnboundThis: true,
        },
      ],
      "prefer-object-spread": "error",
      "prefer-numeric-literals": "error",
      "prefer-promise-reject-errors": [
        "error",
        {
          allowEmptyReject: false,
        },
      ],
      "prefer-regex-literals": [
        "error",
        {
          disallowRedundantWrapping: true,
        },
      ],
      "prefer-exponentiation-operator": "error",

      "react/no-danger-with-children": "error",
      "react/jsx-no-duplicate-props": "warn",
      "react/jsx-curly-brace-presence": ["error", "never"],
      "react/no-unknown-property": ["error", { ignore: ["css"] }],
      // "react/jsx-no-bind": ["warn", { allowArrowFunctions: true }],
      "react/jsx-no-bind": [
        "error",
        {
          allowArrowFunctions: true, // ❌ Allows arrow functions (anti-pattern)
          // allowArrowFunctions: false, // ✅ Recommended for performance
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
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
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
      // "event-handlers/no-bad-event-handlers": "error",
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
            attributes: false,
            arguments: true,
            properties: true,
          },
        },
      ],
      "@typescript-eslint/no-unsafe-return": "error",
      // "@typescript-eslint/no-unsafe-argument": "error",
      // "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        {
          ignoreArrowShorthand: true, // 👈 This allows () => doSomething() style
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
