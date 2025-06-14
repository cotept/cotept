import { ValueTransformer } from "typeorm"

export const booleanTransformer: ValueTransformer = {
  to: (value: boolean) => (value ? 1 : 0),
  from: (value: number) => value === 1,
}
