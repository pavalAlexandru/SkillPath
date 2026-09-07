import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    setupFiles: ["./vitest.integration.setup.ts"],
    include: ["integration-tests/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 20000,
    fileParallelism: false
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
    },
  },
});
