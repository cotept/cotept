import tsParser from "@typescript-eslint/parser"
import importPlugin from "eslint-plugin-import"
import simpleImportSort from "eslint-plugin-simple-import-sort"

/** @type {import("eslint").FlatConfig[]} */
export default [
  {
    name: "base/typescript",
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["dist/**", ".turbo/**", "node_modules/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // project를 제거하여 타입 체크 비활성화
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      import: importPlugin,
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off", // TypeScript가 이미 체크하므로 off
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
]
