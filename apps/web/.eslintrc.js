module.exports = {
  extends: [
    "@repo/eslint-config/next.js",
    "@feature-sliced",
    "plugin:storybook/recommended"
  ],
  settings: {
    // FSD 공식 config는 기본 layers이름을 아래처럼 인식합니다 (커스텀도 가능)
    "boundaries/elements": [
      { type: "app", pattern: "src/app/*" },
      { type: "widgets", pattern: "src/widgets/*" },
      { type: "features", pattern: "src/features/*" },
      { type: "entities", pattern: "src/entities/*" },
      { type: "shared", pattern: "src/shared/*" },
    ],
    // 별칭 사용시 아래 줄 추가 (필요할 때, alias 규칙과 맞춰주면 됨)
    "fsd/alias": "@",
  },
  // 필요하면 커스텀 룰 추가
  rules: {
    // 경로가 항상 alias(@)로 시작해야 함
    "fsd/path-checker": ["error", { alias: "@" }],
    // 퍼블릭 API(index.ts)로만 import 허용
    "fsd/public-api-imports": ["error", { alias: "@" }],
    // 상위 레이어에서 하위 레이어만 import 허용
    "fsd/layer-imports": ["error", { alias: "@" }],
  },
}
