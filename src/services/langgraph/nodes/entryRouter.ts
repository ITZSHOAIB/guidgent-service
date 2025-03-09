import { GRAPH_NODES_KEYS } from ".";
import type { graphState } from "../graphState";

export async function entryRouter(state: typeof graphState.State) {
  console.log("Node Visited: [entryRouter]");
  const classLevel = state.classLevel;
  return classLevel === -1
    ? GRAPH_NODES_KEYS.fetchClassLevel
    : GRAPH_NODES_KEYS.evaluateIntent;
}
