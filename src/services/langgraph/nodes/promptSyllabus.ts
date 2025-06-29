import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { graphState } from "../graphState.js";
import { promptSyllabusPrompt } from "../prompts/promptSyllabus.prompt.js";
import { querySyllabus } from "../../llamaindex/llamaindex.service.js";
import { AIMessage } from "@langchain/core/messages";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";

export async function promptSyllabus(
  state: typeof graphState.State,
  config: LangGraphRunnableConfig
) {
  console.log("Node Visited: [promptSyllabus]");

  const messages = state.messages;
  const humanMessages = messages.filter((msg) => msg.getType() === "human");
  const lastMessage = humanMessages[humanMessages.length - 1].content;

  const conversationHistory = state.messages
    .map(
      (msg) =>
        `${
          msg.getType() === "human" ? "Student" : "Assistant"
        }: ${msg.content.toString()}`
    )
    .join("\n");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", promptSyllabusPrompt()],
    [
      "human",
      "Previous conversation:\n{conversationHistory}\n\nCurrent query: {message}",
    ],
  ]);

  const query = await prompt.invoke({
    classLevel: state.classLevel,
    message: lastMessage,
    conversationHistory,
  });

  const response = await querySyllabus(query.toString());

  let fullResponse = "";
  for await (const chunk of response) {
    fullResponse += chunk.message.content;
    config.writer?.(chunk.message.content);
  }

  return {
    messages: [new AIMessage(fullResponse)],
  };
}
