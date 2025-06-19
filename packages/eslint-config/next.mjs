import globals from "globals"
import baseConfig from "./base.mjs"

/** @type {import("eslint").FlatConfig[]} */
export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
]
