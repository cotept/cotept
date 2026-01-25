import importPlugin from "eslint-plugin-import"
import simpleImportSort from "eslint-plugin-simple-import-sort"

import importRules from "./imports-rules.mjs"

/** @type {import("eslint").FlatConfig[]} */
export default [
  {
    name: "repo/imports/plugins",
    plugins: {
      "simple-import-sort": simpleImportSort,
      import: importPlugin,
    },
  },
  ...importRules,
]
