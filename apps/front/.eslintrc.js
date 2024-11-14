export default module = {
  extends: [
    "next/core-web-vitals",
    "next/typescript",
    "@repo/eslint-config/next.js",
  ],
  rules: {
    "react-hooks/rules-of-hooks": 0,
    "react/react-in-jsx-scope": 0,
  },
}
