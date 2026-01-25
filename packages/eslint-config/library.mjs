import baseConfig from "./base.mjs"
import importConfig from "./imports.mjs"

/** @type {import("eslint").FlatConfig[]} */
export default [...baseConfig, ...importConfig]
