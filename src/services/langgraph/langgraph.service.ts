import {
  Annotation,
  Command,
  END,
  messagesStateReducer,
  START,
  StateGraph,
} from "@langchain/langgraph";
import {
  AIMessage,
  type BaseMessage,
  HumanMessage,
} from "@langchain/core/messages";
import { ChatMistralAI } from "@langchain/mistralai";
import { querySyllabus } from "../llamaindex/llamaindex.service";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { fetchClassLevelPrompt } from "./prompts/fetchClassLevel.prompt";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { promptSyllabusPrompt } from "./prompts/promptSyllabus.prompt";

export type SendDataType = {
  type: "chat" | "end" | "error";
  text?: string;
};

type ClassLevel = 9 | 10 | -1;

const graphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  classLevel: Annotation<ClassLevel>({
    reducer: (left: ClassLevel, right: ClassLevel) => right,
    default: () => -1,
  }),
});

// Mistral model
const model = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY || "",
  temperature: 0.7,
});
// In-memory store
const memory = new Map<string, typeof graphState.State>();

async function entryRouter(state: typeof graphState.State) {
  console.log("[entryRouter] called");
  const classLevel = state.classLevel;
  return classLevel === -1 ? "fetchClassLevel" : "promptSyllabus";
}

async function fetchClassLevel(state: typeof graphState.State) {
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

async function askClassLevel(state: typeof graphState.State) {
  if (globalSendData) {
    globalSendData({
      type: "chat",
      text: "Hello! To provide you with the most relevant information, could you please tell me if you are in class 9 or 10?",
    });

    globalSendData({
      type: "end",
    });
  }
  return;
}

async function promptSyllabus(state: typeof graphState.State) {
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
    if (globalSendData) globalSendData({ type: "chat", text: chunk.delta });
    fullResponse += chunk.message.content;
  }
  if (globalSendData) globalSendData({ type: "end" });

  return {
    messages: [...state.messages, new AIMessage(fullResponse)],
  };
}

const graph = new StateGraph(graphState)
  .addNode("fetchClassLevel", fetchClassLevel, {
    ends: ["askClassLevel", "promptSyllabus"],
  })
  .addNode("askClassLevel", askClassLevel)
  .addNode("promptSyllabus", promptSyllabus)
  .addConditionalEdges(START, entryRouter)
  .compile();

let globalSendData: (data: SendDataType) => void = () => {};
export const invokeGraph = async (
  prompt: string,
  sendData: (data: SendDataType) => void
) => {
  globalSendData = sendData;
  const currentState = memory.get("sessionId") || {
    messages: [],
    classLevel: -1,
  };

  currentState.messages.push(new HumanMessage(prompt));

  const updatedState = await graph.invoke(currentState);

  memory.set("sessionId", updatedState);
};
