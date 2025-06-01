import { FlatCompat } from "@eslint/eslintrc"
import baseConfig from "@repo/eslint-config/base.js"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...baseConfig,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      ...compat.plugins("boundaries").reduce((acc, config) => ({ ...acc, ...config.plugins }), {}),
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/*" },
        { type: "components", pattern: "src/components/*" },
        { type: "features", pattern: "src/features/*" },
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
              from: "features",
              allow: ["shared", "features"],
            },
            {
              from: "components",
              allow: ["shared", "features", "components"],
            },
            {
              from: "pages",
              allow: ["shared", "features", "components", "pages"],
            },
            {
              from: "app",
              allow: ["shared", "features", "components", "pages", "app"],
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

export default eslintConfig
