import { GoogleGenAI } from "@google/genai";
import { env } from "./envVar.js";

const ai = new GoogleGenAI({apiKey: env.GEMINI_API_KEY});

export default ai