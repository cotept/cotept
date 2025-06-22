const baseConfig = require("./base.cjs")

module.exports = [
  ...baseConfig.map(config => ({
    ...config,
    languageOptions: {
      ...config.languageOptions,
      globals: {
        ...config.languageOptions?.globals,
        ...require("globals").node,
        ...require("globals").jest,
      },
    },
  })),
  {
    name: "nest/overrides",
    files: ["**/*.{ts,js}"],
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
  },
]
