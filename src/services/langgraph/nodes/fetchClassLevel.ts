import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { graphState } from "../graphState";
import { fetchClassLevelPrompt } from "../prompts/fetchClassLevel.prompt";
import { model } from "../models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Command } from "@langchain/langgraph";

export async function fetchClassLevel(state: typeof graphState.State) {
  console.log("[fetchClassLevel] called");
  const messages = state.messages;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", fetchClassLevelPrompt()],
    ["human", "{message}"],
  ]);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const humanMessages = messages.filter((msg) => msg.getType() === "human");
  const response = await chain.invoke({
    message: humanMessages[humanMessages.length - 1].content,
  });

  const classLevel = +response;

  return new Command({
    update: {
      classLevel,
    },
    goto: classLevel === -1 ? "askClassLevel" : "promptSyllabus",
  });
}
