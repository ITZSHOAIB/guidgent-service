import type { Request, Response } from "express";
import { sendEvent } from "../utils/sse.util";
import { invokeGraph } from "../services/langgraph/langgraph.service";

// Active chat sessions
const activeSessions = new Map<string, { res: Response }>();

export const buildConnection = async (req: Request, res: Response) => {
  const { sessionId } = req.params || `session_${Date.now()}`;

  console.log(`Session ID: ${sessionId} connected`);

  // SSE setup
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Store session
  activeSessions.set(sessionId, { res });

  // Handle connection close
  req.on("close", () => {
    console.log(`Session ${sessionId} closed`);
    activeSessions.delete(sessionId);
  });
};

export const handleMessage = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { text } = req.body;

  const session = activeSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  try {
    for await (const response of invokeGraph(text)) {
      if (response) {
        sendEvent(session.res, { type: "agent", content: response });
      }
    }

    sendEvent(session.res, { type: "end" });
  } catch (error) {
    console.error(`Error processing message in session ${sessionId}:`, error);
    sendEvent(session.res, {
      type: "error",
      content: "An error occurred while processing your message",
    });
  }

  res.sendStatus(200);
};
