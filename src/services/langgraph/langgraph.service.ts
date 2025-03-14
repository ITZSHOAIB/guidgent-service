import {
  InMemoryStore,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { graphState } from "./graphState";
import { GRAPH_NODES, GRAPH_NODES_KEYS } from "./nodes";

const {
  askClassLevel,
  fetchClassLevel,
  promptSyllabus,
  entryRouter,
  evaluateIntent,
  clarifyIntent,
} = GRAPH_NODES;

const checkpointer = new MemorySaver();
const memoryStore = new InMemoryStore();

const graph = new StateGraph(graphState)
  .addNode(GRAPH_NODES_KEYS.fetchClassLevel, fetchClassLevel, {
    ends: [GRAPH_NODES_KEYS.askClassLevel, GRAPH_NODES_KEYS.evaluateIntent],
  })
  .addNode(GRAPH_NODES_KEYS.askClassLevel, askClassLevel)
  .addNode(GRAPH_NODES_KEYS.promptSyllabus, promptSyllabus)
  .addNode(GRAPH_NODES_KEYS.evaluateIntent, evaluateIntent)
  .addNode(GRAPH_NODES_KEYS.clarifyIntent, clarifyIntent)
  .addConditionalEdges(START, entryRouter)
  .compile({ checkpointer, store: memoryStore });

export async function* invokeGraph(prompt: string) {
  const config = {
    configurable: {
      thread_id: "1234",
    },
  };
  const currentState = {
    messages: [],
    classLevel: -1,
  } as typeof graphState.State;
  currentState.messages.push(new HumanMessage(prompt));

  for await (const chunk of await graph.stream(currentState, {
    streamMode: "custom",
    ...config,
  })) {
    console.log("Chunk", chunk);
    yield chunk;
  }
}
