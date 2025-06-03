import { FlatCompat } from "@eslint/eslintrc"
import baseConfig from "@repo/eslint-config/next"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * eslint 8 -> 9 버전 이상부터는 FlatCompat를 사용하여
 * 레거시 eslint 설정(8버전)의 extends, plugins, configs를 호환.
 */
const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...baseConfig,
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // file dependencies boundaries
  {
    plugins: {
      ...compat.plugins("boundaries").reduce((acc, config) => ({ ...acc, ...config.plugins }), {}),
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/*" },
        { type: "pages", pattern: "src/pages/*" },
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
              from: "pages",
              allow: ["shared", "features", "pages"],
            },
            {
              from: "app",
              allow: ["shared", "features", "pages", "app"],
            },
          ],
        },
      ],
    },
  },
  //import sort
  {
    plugins: {
      "simple-import-sort": compat.plugins("simple-import-sort"),
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^react$"], // 1. React
            ["^next"], // 2. Next.js 관련 패키지
            ["^@?\\w"], // 3. 외부 패키지
            ["^@app/", "^@pages/", "^@features/", "^@customs/", "^@shared/"], // 4. 내부 alias
            ["^src/"], // 5. src 절대경로 import
            ["^\\.\\.(?!/?$)", "^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"], // 6. 상대경로
            ["^.+\\.s?css$"], // 7. 스타일(css, scss)
            ["^.+\\.types$"], // 8. 타입 import
          ],
        },
      ],
    },
  },
  // storybook
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
  // ignore
  {
    ignores: ["**/node_modules", "**/dist", "**/.next"],
  },
]

export default eslintConfig
