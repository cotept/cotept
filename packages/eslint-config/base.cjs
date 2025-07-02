const tsPlugin = require("@typescript-eslint/eslint-plugin")
const tsParser = require("@typescript-eslint/parser")
const simpleImportSort = require("eslint-plugin-simple-import-sort")

// 타입 체크를 요구하지 않는 TypeScript 규칙만 포함
module.exports = [
  {
    name: "base/typescript",
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["dist/**", ".turbo/**", "node_modules/**", "logs/**"],
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
      "@typescript-eslint": tsPlugin,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off", // TypeScript가 이미 체크하므로 off
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      // 타입 체크가 필요한 규칙들은 제거
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
]
