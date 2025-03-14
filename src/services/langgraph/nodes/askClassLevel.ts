import { AIMessage } from "@langchain/core/messages";
import type { graphState } from "../graphState";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";

export async function askClassLevel(
  state: typeof graphState.State,
  config: LangGraphRunnableConfig
) {
  console.log("Node Visited: [askClassLevel]");
  config.writer?.(
    "Hello! To provide you with the most relevant information, could you please tell me if you are in class 9 or 10?"
  );
}
