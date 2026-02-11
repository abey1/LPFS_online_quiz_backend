import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

console.log("Has key?", Boolean(process.env.GEMINI_API_KEY));

const ai = new GoogleGenAI({}); // reads GEMINI_API_KEY from env

try {
  const resp = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Say hello in one short sentence.",
  });
  console.log(resp.text);
} catch (err) {
  console.error("FULL ERROR:", err);
}
