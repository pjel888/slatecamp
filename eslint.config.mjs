import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Allow setState in effects for valid patterns: reset on deps change, hydrate from localStorage
      "react-hooks/set-state-in-effect": "off",
      // Allow unused args/vars prefixed with _
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Allow <img> where next/image is not practical (dynamic URLs, content images)
      "@next/next/no-img-element": "warn",
      // Ban native browser dialogs — use ConfirmDialog/AlertDialog from @/components/ui/dialog
      "no-restricted-globals": ["error", "alert", "confirm", "prompt"],
      // Flag hardcoded hex colors in Tailwind classes — use design tokens instead
      "no-restricted-syntax": ["warn",
        {
          selector: "Literal[value=/(?:text|bg|border|ring|outline|shadow|accent|fill|stroke)-\\[#[0-9a-fA-F]/]",
          message: "Avoid hardcoded hex in Tailwind classes. Use a design token (e.g., text-primary, bg-muted, border-border) or a shade scale (e.g., bg-primary-50, text-success-700).",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
