module.exports = {
  root: true,
  extends: ["./base.cjs"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.cjs"],
  rules: {
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          ["^node:"],
          ["^@nestjs"],
          ["^@?\\w"],
          ["^@app/", "^@configs/", "^@modules/", "^@shared/", "^@libs/"],
          ["^src/"],
          ["^\\.\\.(?!/?$)", "^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          ["^.+\\.s?css$"],
          ["^.+\\.types$"],
        ],
      },
    ],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
}
