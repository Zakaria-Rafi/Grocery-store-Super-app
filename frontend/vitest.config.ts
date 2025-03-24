import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/**"],
    reporters: ["junit"],
    coverage: {
      reporter: ["lcov"],
    },
    outputFile: {
      junit: "junit.xml",
    },
  },
});
