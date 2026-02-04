import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import globals from "globals"

import baseConfig from "./base.mjs"
import importRules from "./imports-rules.mjs"

/** @type {import("eslint").FlatConfig[]} */
export default [
  ...baseConfig,
  ...nextCoreWebVitals,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
  },
  ...importRules,
  {
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^node:"],
            ["^react$", "^react/.*"],
            ["^next", "^next/.*"],
            ["^@repo/"],
            ["^@?\\w"],
            ["^@app/", "^@containers/", "^@features/", "^@customs/", "^@shared/", "^@libs/"],
            ["^src/"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            ["^.+\\.s?css$"],
            ["^.*\\u0000$"],
          ],
        },
      ],
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
]