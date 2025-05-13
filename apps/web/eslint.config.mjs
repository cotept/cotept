import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"
import baseConfig from "@repo/eslint-config/base.js"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  ...baseConfig,

  // FSD 플러그인 수동 구현
  {
    plugins: {
      ...compat.plugins("boundaries").reduce((acc, config) => ({ ...acc, ...config.plugins }), {}),
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/*" },
        { type: "pages", pattern: "src/pages/*" },
        { type: "widgets", pattern: "src/widgets/*" },
        { type: "features", pattern: "src/features/*" },
        { type: "entities", pattern: "src/entities/*" },
        { type: "shared", pattern: "src/shared/*" },
      ],
      "boundaries/ignore": ["**/*.d.ts", "**/*.spec.ts", "**/*.test.ts"],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "shared",
              allow: ["shared"],
            },
            {
              from: "entities",
              allow: ["shared", "entities"],
            },
            {
              from: "features",
              allow: ["shared", "entities", "features"],
            },
            {
              from: "widgets",
              allow: ["shared", "entities", "features", "widgets"],
            },
            {
              from: "pages",
              allow: ["shared", "entities", "features", "widgets", "pages"],
            },
            {
              from: "app",
              allow: ["shared", "entities", "features", "widgets", "pages", "app"],
            },
          ],
        },
      ],
      "boundaries/entry-point": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              target: ["**"],
              allow: ["**/index.js", "**/index.ts", "**/index.jsx", "**/index.tsx"],
            },
          ],
        },
      ],
    },
  },

  // Storybook 규칙은 stories 파일에만 적용
  {
    files: ["**/*.stories.@(js|jsx|ts|tsx)"],
    ...compat.plugins("storybook"),
    ...compat.config({
      rules: {
        "storybook/default-exports": "error",
        "storybook/story-exports": "error",
        "storybook/await-interactions": "error",
        "storybook/use-storybook-testing-library": "error",
        "storybook/use-storybook-expect": "error",
      },
    }),
  },
  {
    ignores: ["**/node_modules", "**/dist", "**/.next"],
  },
]
