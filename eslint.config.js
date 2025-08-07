import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage", "*.min.js"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn", // Reduced from error
      "@typescript-eslint/no-unsafe-assignment": "warn", // Reduced from error
      "@typescript-eslint/no-unsafe-member-access": "warn", // Reduced from error
      "@typescript-eslint/no-unsafe-call": "warn", // Reduced from error
      "@typescript-eslint/no-unsafe-return": "warn", // Reduced from error
      "@typescript-eslint/no-unsafe-argument": "warn", // Reduced from error
      "@typescript-eslint/restrict-template-expressions": "warn", // Reduced from error
      "@typescript-eslint/restrict-plus-operands": "warn", // Reduced from error
      "@typescript-eslint/no-floating-promises": "warn", // Reduced from error
      "@typescript-eslint/no-misused-promises": "warn", // Reduced from error
      "@typescript-eslint/prefer-nullish-coalescing": "warn", // Reduced from error
      "@typescript-eslint/no-confusing-void-expression": "warn", // Reduced from error
      "@typescript-eslint/no-dynamic-delete": "warn", // Reduced from error
      "@typescript-eslint/no-extraneous-class": "warn", // Reduced from error
      "@typescript-eslint/no-unnecessary-type-parameters": "warn", // Reduced from error
      "@typescript-eslint/prefer-reduce-type-parameter": "warn", // Reduced from error
      "@typescript-eslint/no-unnecessary-condition": "warn", // Reduced from error
      "@typescript-eslint/unbound-method": "warn", // Reduced from error
      "@typescript-eslint/no-misused-spread": "warn", // Reduced from error
      "@typescript-eslint/no-useless-constructor": "warn", // Reduced from error
      "no-console": ["warn", { allow: ["warn", "error", "log"] }], // Allow console.log
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "no-trailing-spaces": "error",
      // "indent": ["error", 2, { "SwitchCase": 1 }], // Disabled due to ESLint stack overflow on large files
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "space-in-parens": ["error", "never"],
      "block-spacing": "error",
      "key-spacing": "error",
      "arrow-spacing": "error",
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
      "padded-blocks": ["error", "never"],
      "space-before-blocks": "error",
      "keyword-spacing": "error",
      "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
      "curly": ["error", "all"],
      "no-else-return": "error",
      "no-lonely-if": "error",
      "no-unneeded-ternary": "error",
      "operator-linebreak": ["error", "before"],
      "space-before-function-paren": ["error", {
        "anonymous": "never",
        "named": "never",
        "asyncArrow": "always"
      }],
      "space-infix-ops": "error",
      "space-unary-ops": "error",
      "spaced-comment": ["error", "always"],
      "switch-colon-spacing": "error",
      "template-curly-spacing": ["error", "never"],
      "wrap-iife": ["error", "any"],
      "yoda": "error",
      "max-len": ["warn", { "code": 120, "ignoreUrls": true, "ignoreStrings": true, "ignoreTemplateLiterals": true, "ignoreRegExpLiterals": true }],
      "no-duplicate-imports": "error",
    },
  },
  {
    files: ["**/*.js"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
);
