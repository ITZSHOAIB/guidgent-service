import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { graphState } from "../graphState.js";
import { fetchClassLevelPrompt } from "../prompts/fetchClassLevel.prompt.js";
import { model } from "../models.js";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Command } from "@langchain/langgraph";
import { GRAPH_NODES_KEYS } from "./index.js";

export async function fetchClassLevel(state: typeof graphState.State) {
  console.log("Node Visited: [fetchClassLevel]");

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
    goto:
      classLevel === -1
        ? GRAPH_NODES_KEYS.askClassLevel
        : GRAPH_NODES_KEYS.evaluateIntent,
  });
}
