import { MistralAI } from "../mistral-ai/mistralai.service";
import { Settings, VectorStoreIndex } from "llamaindex";
import { PDFReader } from "@llamaindex/readers/pdf";
import path from "node:path";
import {
  HuggingFaceEmbedding,
  HuggingFaceEmbeddingModelType,
} from "@llamaindex/huggingface";

Settings.embedModel = new HuggingFaceEmbedding({
  modelType: HuggingFaceEmbeddingModelType.XENOVA_ALL_MINILM_L6_V2,
});
Settings.llm = new MistralAI({
  model: "mistral-tiny",
  apiKey: process.env.MISTRAL_API_KEY || "",
});

let syllabusIndex: VectorStoreIndex | null = null;

export const initializeLlamaindex = async () => {
  if (syllabusIndex) return;

  console.log("Initializing Llamaindex");

  const reader = new PDFReader();
  const syllabusPath = path.join(
    __dirname,
    "../../syllabus/" + "CBSE_IX_X.pdf"
  );

  const document = await reader.loadData(syllabusPath);
  const index = await VectorStoreIndex.fromDocuments(document);
  syllabusIndex = index;
};

export const querySyllabus = async (query: string, stream = true) => {
  await initializeLlamaindex();

  if (!syllabusIndex) {
    throw new Error("Index not initialized");
  }

  const queryEngine = syllabusIndex.asQueryEngine();

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let response: any;
  if (stream) {
    response = await queryEngine.query({ query, stream: true });
  } else {
    response = await queryEngine.query({ query });
  }

  return response;
};
