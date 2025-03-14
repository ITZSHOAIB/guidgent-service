import { askClassLevel } from "./askClassLevel.js";
import { fetchClassLevel } from "./fetchClassLevel.js";
import { promptSyllabus } from "./promptSyllabus.js";
import { entryRouter } from "./entryRouter.js";
import { evaluateIntent } from "./evaluateIntent.js";
import { clarifyIntent } from "./clarifyIntent.js";

const GRAPH_NODES = {
  askClassLevel,
  fetchClassLevel,
  promptSyllabus,
  entryRouter,
  evaluateIntent,
  clarifyIntent,
};

const GRAPH_NODES_KEYS = Object.fromEntries(
  Object.keys(GRAPH_NODES).map((key) => [key, key])
);

export { GRAPH_NODES, GRAPH_NODES_KEYS };
