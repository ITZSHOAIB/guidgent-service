import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { graphState } from "../graphState.js";
import { evaluateIntentPrompt } from "../prompts/evaluateIntent.prompt.js";
import { model } from "../models.js";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Command, END } from "@langchain/langgraph";
import { GRAPH_NODES_KEYS } from "./index.js";

export async function evaluateIntent(state: typeof graphState.State) {
  console.log("Node Visited: [evaluateIntent]");

  const humanMessages = state.messages.filter(
    (msg) => msg.getType() === "human"
  );
  const lastMessage = humanMessages[humanMessages.length - 1].content;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", evaluateIntentPrompt()],
    ["human", "{message}"],
  ]);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const response = await chain.invoke({
    classLevel: state.classLevel,
    message: lastMessage,
  });

  const isSufficient = +response === 1;

  return new Command({
    goto: isSufficient
      ? GRAPH_NODES_KEYS.promptSyllabus
      : GRAPH_NODES_KEYS.clarifyIntent,
  });
}
