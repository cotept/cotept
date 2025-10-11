const fs = require("fs")
const yaml = require("yaml")
const path = require("path")

const extractEnums = (openApiDoc) => {
  const schemas = openApiDoc.components?.schemas
  if (!schemas) return {}
  const enumConstants = {}
  for (const [key, schema] of Object.entries(schemas)) {
    if ("enum" in schema && "x-enumNames" in schema) {
      const enumValues = schema.enum
      const enumNames = schema["x-enumNames"]
      const enumMap = enumNames.reduce((acc, name, index) => {
        acc[name] = enumValues[index]
        return acc
      }, {})
      const enumKey = key.replaceAll(".", "_")
      enumConstants[key] = `
  export const ${enumKey} = {
    ${enumNames.map((name) => `${name}: "${enumMap[name]}"`).join(",\n")}
  } as const;
      `
    }
  }
  return `export namespace extraEnums {
    ${Object.values(enumConstants).join("\n")}
}`
}

const specPath = path.join(__dirname, "../openapi-spec.yaml")
const specContent = fs.readFileSync(specPath, "utf-8")
const openApiDoc = yaml.parse(specContent)
const enumsCode = extractEnums(openApiDoc)

fs.writeFileSync(path.join(__dirname, "../src/types/extra-enums.ts"), enumsCode, "utf-8")
console.log("✅ Enums extracted")

// Append export to types/index.ts
const typesIndexPath = path.join(__dirname, "../src/types/index.ts")
const exportStatement = "export * from './extra-enums';\n"

fs.appendFileSync(typesIndexPath, exportStatement, "utf-8")
console.log("✅ Export statement added to types/index.ts")
