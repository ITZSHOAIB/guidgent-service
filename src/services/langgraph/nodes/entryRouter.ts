import type { graphState } from "../graphState";

export async function entryRouter(state: typeof graphState.State) {
  console.log("[entryRouter] called");
  const classLevel = state.classLevel;
  return classLevel === -1 ? "fetchClassLevel" : "promptSyllabus";
}
