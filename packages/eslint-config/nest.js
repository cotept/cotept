export default module = {
  root: true,
  extends: ["./base.js"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          // 1. Node.js 내장 모듈
          ["^node:"],
          // 2. NestJS core imports
          ["^@nestjs"],
          // 3. 외부 패키지 (알파벳순)
          ["^@?\\w"],
          // 4. 내부 alias (예: @app/, @modules/, @libs/)
          ["^@app/", "^@configs/", "^@modules/", "^@shared/", "^@libs/"],
          // 5. 절대경로 (src 기준)
          ["^src/"],
          // 6. 상대경로 (부모 → 현재 디렉토리)
          ["^\\.\\.(?!/?$)", "^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          // 7. style/scss/css
          ["^.+\\.s?css$"],
          // 8. type-only imports (선택)
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
