import {
  InMemoryStore,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { graphState } from "./graphState.js";
import { GRAPH_NODES, GRAPH_NODES_KEYS } from "./nodes/index.js";

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

export async function* invokeGraph(
  prompt: string,
  sessionId: string = "default"
) {
  const config = {
    configurable: {
      thread_id: sessionId,
    },
  };

  let currentState: typeof graphState.State;

  try {
    const existingState = await graph.getState(config);
    if (existingState.values && typeof existingState.values === "object") {
      currentState = existingState.values;
      if (!currentState.messages || !Array.isArray(currentState.messages)) {
        currentState.messages = [];
      }
      if (currentState.classLevel === undefined) {
        currentState.classLevel = -1;
      }
    } else {
      currentState = {
        messages: [],
        classLevel: -1,
      } as typeof graphState.State;
    }
  } catch (error) {
    console.log(
      `Creating new state for session ${sessionId}:`,
      error instanceof Error ? error.message : String(error)
    );
    currentState = {
      messages: [],
      classLevel: -1,
    } as typeof graphState.State;
  }

  currentState.messages.push(new HumanMessage(prompt));

  for await (const chunk of await graph.stream(currentState, {
    streamMode: "custom",
    ...config,
  })) {
    yield chunk;
  }
}
