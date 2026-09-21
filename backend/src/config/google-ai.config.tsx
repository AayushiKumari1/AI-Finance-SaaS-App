import { GoogleGenAI } from "@google/genai";
import { Env } from "./env.config.js";

export const genAI = new GoogleGenAI({
    apiKey: Env.GEMINI_API_KEY,
});

export const genAIModel = "gemini-3.8-flash"

// https://aistudio.google.com/docs/text-generation