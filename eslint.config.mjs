import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // setState in effects is a common, legitimate pattern for resetting
      // derived UI state (closing navs on route change, resetting forms on
      // modal open/close, resetting pagination on filter change, etc.).
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
