import type { Request, Response } from "express";
import { sendEvent, setupSSE } from "../utils/sse.util";
import { invokeGraph } from "../services/langgraph/langgraph.service";

export const handleEvents = (req: Request, res: Response) => {
  setupSSE(res);

  const handleMessage = async (message: { text: string }) => {
    for await (const response of invokeGraph(message.text)) {
      console.log("Graph response", response);
      sendEvent(res, { type: "agent", content: response });
    }
    sendEvent(res, { type: "end" });
  };

  req.on("close", () => {
    console.log("Client closed connection");
  });

  return { handleMessage };
};

export const handlePostMessage = (
  req: Request,
  res: Response,
  handleMessage: (message: { text: string }) => Promise<void>
) => {
  handleMessage(req.body);
  res.sendStatus(200);
};
