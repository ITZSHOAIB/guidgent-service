import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { graphState } from "../graphState";
import type { SendDataType } from "../langgraph.service";
import { model } from "../models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { clarifyIntentPrompt } from "../prompts/clarifyIntent.prompt";
import { AIMessage } from "@langchain/core/messages";

export async function clarifyIntent(
  state: typeof graphState.State,
  sendData: (data: SendDataType) => void
) {
  console.log("Node Visited: [clarifyIntent]");

  const humanMessages = state.messages.filter(
    (msg) => msg.getType() === "human"
  );
  const lastMessage = humanMessages[humanMessages.length - 1].content;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", clarifyIntentPrompt()],
    ["human", "{message}"],
  ]);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  let fullResponse = "";
  for await (const chunk of await chain.stream({
    classLevel: state.classLevel,
    message: lastMessage,
  })) {
    fullResponse += chunk;
    sendData({ type: "chat", text: chunk });
  }
  sendData({ type: "end" });

  return {
    messages: [...state.messages, new AIMessage(fullResponse)],
  };
}
