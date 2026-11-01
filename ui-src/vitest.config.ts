import { defineConfig } from "vitest/config";

// Kept apart from vite.config.ts (the library build): tests run the source
// directly, in Node, without the MDK shared-module externals.
export default defineConfig({
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**"],
    environment: "node",
    // MDK's UI packages publish ESM with directory and extensionless imports,
    // which Node's loader rejects. Let Vite transform them instead
    // (docs/mdk-friction.md).
    server: { deps: { inline: [/@tetherto\/mdk-/] } },
    // `npm run test:coverage`, for CI's coverage gate. It measures the logic
    // the tests cover: the API layer, the shared helpers and each feature's
    // shape. Pages, components and hooks (lib/use-*, lib/view) only render or
    // wire React, and have no DOM tests. The plugin's tests load it with a
    // plain require, which v8 coverage through Vite doesn't see.
    coverage: {
      provider: "v8",
      reporter: ["json", "text-summary"],
      reportsDirectory: "../coverage",
      include: ["api/**/*.ts", "lib/**/*.ts", "features/**/*-shape.ts"],
      exclude: ["**/*.test.ts", "**/report-fixture.ts", "lib/use-*.ts", "lib/view.ts"],
    },
  },
});
