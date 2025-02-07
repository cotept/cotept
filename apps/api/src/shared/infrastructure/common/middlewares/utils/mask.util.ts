// utils/mask.util.ts
export const maskSensitiveData = (body: Record<string, any>) => {
  const MASK_KEYS = ["password", "creditCard", "token"]
  return Object.entries(body).reduce((acc, [key, value]) => {
    acc[key] = MASK_KEYS.includes(key) ? "***MASKED***" : value
    return acc
  }, {})
}
