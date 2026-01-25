/** @type {import("eslint").FlatConfig[]} */
export default [
  {
    name: "repo/imports/rules",
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
    },
  },
]
