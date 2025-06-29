import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { graphState } from "../graphState.js";
import { model } from "../models.js";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { clarifyIntentPrompt } from "../prompts/clarifyIntent.prompt.js";
import { AIMessage } from "@langchain/core/messages";
import { querySyllabus } from "../../llamaindex/llamaindex.service.js";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";

export async function clarifyIntent(
  state: typeof graphState.State,
  config: LangGraphRunnableConfig
) {
  console.log("Node Visited: [clarifyIntent]");

  const humanMessages = state.messages.filter(
    (msg) => msg.getType() === "human"
  );
  const lastMessage = humanMessages[humanMessages.length - 1].content;

  const retrievedSyllabusChunks = await querySyllabus(
    lastMessage.toString(),
    false
  );

  const conversationHistory = state.messages
    .map(
      (msg) =>
        `${
          msg.getType() === "human" ? "Student" : "Assistant"
        }: ${msg.content.toString()}`
    )
    .join("\n");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", clarifyIntentPrompt()],
    [
      "human",
      "Previous conversation:\n{conversationHistory}\n\nCurrent message: {message}",
    ],
  ]);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  let fullResponse = "";
  for await (const chunk of await chain.stream({
    classLevel: state.classLevel,
    message: lastMessage,
    conversationHistory,
    retrievedSyllabusChunks,
  })) {
    fullResponse += chunk;
    config.writer?.(chunk);
  }

  return {
    messages: [new AIMessage(fullResponse)],
  };
}
