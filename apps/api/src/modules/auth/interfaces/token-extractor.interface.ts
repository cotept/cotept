// auth/interfaces/token-extractor.interface.ts
import { Request } from "express"
// import { Socket } from "socket.io"
// import { RTCPeerConnection } from "webrtc"

export interface TokenExtractor {
  fromHttpRequest(request: Request): string | null
  // fromWebSocket(socket: Socket): string | null
  // fromWebRTC(connection: RTCPeerConnection): string | null
}
