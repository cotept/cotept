import { setupWorker } from "msw/browser"
import { mentorHandler } from "./hanlders"

const handlers = [...mentorHandler]

export const worker = setupWorker(...handlers)
