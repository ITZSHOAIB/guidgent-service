import { START, StateGraph } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { graphState } from "./graphState";
import { GRAPH_NODES, GRAPH_NODES_KEYS } from "./nodes";

export type SendDataType = {
  type: "chat" | "end" | "error";
  text?: string;
};

const { askClassLevel, fetchClassLevel, promptSyllabus, entryRouter } =
  GRAPH_NODES;

// In-memory store
const memory = new Map<string, typeof graphState.State>();

const graph = new StateGraph(graphState)
  .addNode(GRAPH_NODES_KEYS.fetchClassLevel, fetchClassLevel, {
    ends: [GRAPH_NODES_KEYS.askClassLevel, GRAPH_NODES_KEYS.promptSyllabus],
  })
  .addNode(GRAPH_NODES_KEYS.askClassLevel, (state) =>
    askClassLevel(state, globalSendData)
  )
  .addNode(GRAPH_NODES_KEYS.promptSyllabus, (state) =>
    promptSyllabus(state, globalSendData)
  )
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
