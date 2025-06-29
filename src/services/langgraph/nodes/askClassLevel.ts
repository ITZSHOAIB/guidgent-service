import type { graphState } from "../graphState.js";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";

export async function askClassLevel(
  state: typeof graphState.State,
  config: LangGraphRunnableConfig
) {
  console.log("Node Visited: [askClassLevel]");

  let message =
    "Hello! To provide you with the most relevant information, could you please tell me if you are in class 9 or 10?";

  if (state.messages.length > 1) {
    message =
      "I see we're continuing our conversation. To provide you with the most relevant information from the CBSE mathematics syllabus, could you please tell me if you are in class 9 or 10?";
  }

  config.writer?.(message);
}
