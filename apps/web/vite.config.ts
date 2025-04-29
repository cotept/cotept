import { cloudflare } from "@cloudflare/vite-plugin"
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => {
  const isStorybook = process.env.STORYBOOK === "true"
  const isTest = process.env.NODE_ENV === "test" || mode === "test"
  console.log({ isStorybook, isTest })
  return {
    plugins: [
      tailwindcss(),
      tsconfigPaths(),
      !isTest && !isStorybook && cloudflare({ viteEnvironment: { name: "ssr" } }),
      !isTest && !isStorybook && reactRouter(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "src"),
      },
    },
  }
})
