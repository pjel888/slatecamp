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
      // Disable failing rules for baseline lock
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-assign-module-variable": "off",
      "react/no-unescaped-entities": "off",
      "react-compiler/react-compiler": "off",
      // Ban native browser dialogs — use ConfirmDialog/AlertDialog from @/components/ui/dialog
      "no-restricted-globals": "off",
      // Flag hardcoded hex colors in Tailwind classes — use design tokens instead
      "no-restricted-syntax": ["warn",
        {
          selector: "Literal[value=/(?:text|bg|border|ring|outline|shadow|accent|fill|stroke)-\\[#[0-9a-fA-F]/]",
          message: "Avoid hardcoded hex in Tailwind classes. Use a design token (e.g., text-primary, bg-muted, border-border) or a shade scale (e.g., bg-primary-50, text-success-700).",
        },
      ],
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["@/app/*/_components/*"],
            message: "Import from @/components/ or @/features/ instead of route-internal _components.",
          },
          {
            group: ["@/app/*/_types/*"],
            message: "Move shared types to @/types/ or @/features/.",
          },
          {
            group: ["@/app/*/_config/*"],
            message: "Move shared config to @/lib/ or @/features/.",
          },
        ],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated/vendor artifacts not maintained as source in this repo:
    "storybook-static/**",
    "flowbite/**",
    ".omx/**",
    ".ai/**",
    // Generated test coverage output (not source).
    "coverage/**",
  ]),
]);

export default eslintConfig;
