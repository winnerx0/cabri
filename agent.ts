import { createAgent, HumanMessage, SystemMessage } from "langchain";
import { getCurrentDateTime, createJobSteps } from "./tools";
import { ChatGroq } from "@langchain/groq";
import { env } from "bun";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-20b",
  temperature: 0,
  maxOutputTokens: 1000,
  maxRetries: 3,
});

// const model = new ChatGoogleGenerativeAI({
//   apiKey: env.GOOGLE_API_KEY,
//   model: "gemini-2.5-pro",
//   temperature: 0.7,
//   maxOutputTokens: 1000,
//   maxRetries: 3,
// });


export const agent = createAgent({
  model,
  tools: [getCurrentDateTime, createJobSteps],
});
