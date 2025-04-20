import { setupServer } from "msw/node"
import { mentorHandler } from "./hanlders"

const handlers = [...mentorHandler]

export const server = setupServer(...handlers)
