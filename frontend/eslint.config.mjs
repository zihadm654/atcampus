import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config(
    {
      extends: [
        "next/core-web-vitals",
        "next/typescript",
        "next",
        "prettier",
        "plugin:tailwindcss/recommended",
      ],
      ignorePatterns: ["/generated/**/*"],
    },
    {
      rules: {
        "@next/next/no-html-link-for-pages": "off",
        "react/jsx-key": "off",
        "tailwindcss/no-custom-classname": "off",
        "tailwindcss/classnames-order": "error",
      },
      settings: {
        tailwindcss: {
          callees: ["cn"],
          config: "tailwind.config.ts",
        },
        next: {
          rootDir: true,
        },
      },
      overrides: [
        {
          files: ["*.ts", "*.tsx"],
          parser: "@typescript-eslint/parser",
          rules: {
            "no-undef": "off",
            "@typescript-eslint/no-undef": "error",
          },
        },
      ],
    },
  ),
];

export default eslintConfig;
