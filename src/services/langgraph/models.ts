import { ChatMistralAI } from "@langchain/mistralai";

// Mistral model
export const model = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY || "",
  temperature: 0.7,
});
