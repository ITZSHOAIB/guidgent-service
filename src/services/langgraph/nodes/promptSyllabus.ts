import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { graphState } from "../graphState";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch";
import { promptSyllabusPrompt } from "../prompts/promptSyllabus.prompt";
import { querySyllabus } from "../../llamaindex/llamaindex.service";
import { AIMessage } from "@langchain/core/messages";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";

export async function promptSyllabus(
  state: typeof graphState.State,
  config: LangGraphRunnableConfig
) {
  console.log("Node Visited: [promptSyllabus]");

  const messages = state.messages;
  const humanMessages = messages.filter((msg) => msg.getType() === "human");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", promptSyllabusPrompt()],
    ["human", "{message}"],
  ]);

  const query = await prompt.invoke({
    classLevel: state.classLevel,
    message: humanMessages[humanMessages.length - 1].content,
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
