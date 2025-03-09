import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { graphState } from "../graphState";
import type { SendDataType } from "../langgraph.service";
import { promptSyllabusPrompt } from "../prompts/promptSyllabus.prompt";
import { querySyllabus } from "../../llamaindex/llamaindex.service";
import { AIMessage } from "@langchain/core/messages";

export async function promptSyllabus(
  state: typeof graphState.State,
  sendData: (data: SendDataType) => void
) {
  console.log("[promptSyllabus] called");
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
    sendData({ type: "chat", text: chunk.delta });
    fullResponse += chunk.message.content;
  }
  sendData({ type: "end" });

  return {
    messages: [...state.messages, new AIMessage(fullResponse)],
  };
}
