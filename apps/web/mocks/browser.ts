import { setupWorker } from "msw/browser"

import { mentorHandler } from "./handlers"

const handlers = [...mentorHandler]

export const worker = setupWorker(...handlers)
