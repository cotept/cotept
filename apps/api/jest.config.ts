import { Config } from "@jest/types"
import { pathsToModuleNameMapper } from "ts-jest"
import { compilerOptions } from "./tsconfig.json"

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageDirectory: "./coverage",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: "<rootDir>/",
  }),
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testSequencer: "@jest/test-sequencer",
}

export default config
