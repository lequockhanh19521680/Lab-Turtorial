module.exports = {
  extends: ["./index.js"],
  env: {
    node: true,
    jest: true
  },
  rules: {
    "no-console": "off",
    "@typescript-eslint/no-var-requires": "off"
  }
};