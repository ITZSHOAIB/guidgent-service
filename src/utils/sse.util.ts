import type { Response } from "express";

export function setupSSE(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
}

export type SendDataType = {
  type: "agent" | "end" | "error";
  content?: unknown;
};

export function sendEvent(res: Response, data: SendDataType) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}
