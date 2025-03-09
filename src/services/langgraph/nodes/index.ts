import { askClassLevel } from "./askClassLevel";
import { fetchClassLevel } from "./fetchClassLevel";
import { promptSyllabus } from "./promptSyllabus";
import { entryRouter } from "./entryRouter";

const GRAPH_NODES = {
  askClassLevel,
  fetchClassLevel,
  promptSyllabus,
  entryRouter,
};

const GRAPH_NODES_KEYS = Object.fromEntries(
  Object.keys(GRAPH_NODES).map((key) => [key, key])
);

export { GRAPH_NODES, GRAPH_NODES_KEYS };
