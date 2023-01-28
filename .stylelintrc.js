// eslint-disable-next-line no-undef
module.exports = {
  processors: ["stylelint-processor-styled-components"],
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-styled-components",
    "stylelint-config-prettier"
  ],
  customSyntax: "postcss-scss",
  rules: {
    "selector-type-case": ["lower", { "ignoreTypes": ["/^\\$\\w+/"] }],
    "declaration-colon-newline-after": null
  }
}