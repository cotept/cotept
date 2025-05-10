import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isStorybook = process.env.STORYBOOK === "true"
  const isTest = process.env.NODE_ENV === "test" || mode === "test"

  console.log({ isStorybook, isTest })

  return {
    plugins: [
      tailwindcss(),
      tsconfigPaths(),
      !isTest && !isStorybook && TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
      react(),
    ].filter(Boolean),
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
    },
    resolve: {},
  }
})
