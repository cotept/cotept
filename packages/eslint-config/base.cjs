const tsPlugin = require("@typescript-eslint/eslint-plugin")
const tsParser = require("@typescript-eslint/parser")
const simpleImportSort = require("eslint-plugin-simple-import-sort")
const importPlugin = require("eslint-plugin-import")
const unusedImports = require("eslint-plugin-unused-imports")

// 타입 체크를 요구하지 않는 TypeScript 규칙만 포함
module.exports = [
  {
    name: "base/typescript",
    files: ["**/*.{ts,js}"],
    ignores: ["dist/**", ".turbo/**", "node_modules/**", "logs/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // project를 제거하여 타입 체크 비활성화
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "simple-import-sort": simpleImportSort,
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off", // TypeScript가 이미 체크하므로 off
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_"
        }
      ],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      // 타입 체크가 필요한 규칙들은 제거
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
]
