import baseConfig from "@repo/eslint-config/next"

import { dirname } from "path"
import boundariesPlugin from "eslint-plugin-boundaries"
import storybookPlugin from "eslint-plugin-storybook"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

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
      boundaries: boundariesPlugin,
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
  //import sort - custom rules for this app
  {
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Side effect imports.
            ["^\\u0000"],
            // Node.js builtins prefixed with `node:`.
            ["^node:"],
            // 1. React 및 React 관련 패키지 (side effect imports)
            ["^react$", "^react/.*"],

            // 2. Next.js 관련 패키지
            ["^next", "^next/.*"],

            // 3. 모노레포 공유 패키지
            ["^@repo/"],

            // 4. 외부 패키지 (node_modules의 패키지들)
            ["^@?\\w"],

            // 5. 내부 alias imports
            ["^@app/", "^@pages/", "^@features/", "^@customs/", "^@shared/"],

            // 6. src 절대경로 import
            ["^src/"],

            // 7. 상대경로 imports (부모 디렉토리 먼저, 같은 디렉토리 마지막)
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],

            // 8. 스타일 파일들
            ["^.+\\.s?css$"],

            // 9. 타입 전용 imports (TypeScript type imports)
            ["^.*\\u0000$"],
          ],
        },
      ],
    },
  },
  // storybook
  {
    files: ["**/*.stories.@(js|jsx|ts|tsx)"],
    plugins: {
      storybook: storybookPlugin,
    },
    rules: {
      "storybook/default-exports": "error",
      "storybook/story-exports": "error",
      "storybook/await-interactions": "error",
      "storybook/use-storybook-testing-library": "error",
      "storybook/use-storybook-expect": "error",
    },
  },
  // ignore
  {
    ignores: ["**/node_modules", "**/dist", "**/.next"],
  },
]

export default eslintConfig
