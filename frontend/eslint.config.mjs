// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  {
    ignores: [
      "**/dist/*",
      "**/node_modules/*",
      "**/docs/*",
      "**/coverage/*",
      "**tests/**/*.snap",
      "**/components/ui/*",
    ],
  },
  {
    files: ["**/*.ts", "**/*.vue"],
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "no-console": "warn",
      "max-len": [
        "warn",
        {
          code: 150,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: false,
        },
      ],
    },
  },
  {
    files: ["tests/**/*.ts", "tests/**/*.vue"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.tests.json"],
      },
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
