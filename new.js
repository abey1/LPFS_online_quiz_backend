import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const app = express();

// If your frontend is Netlify, you can tighten this later to your exact domain.
app.use(cors());
app.use(express.json());

/**
 * Reads GEMINI_API_KEY from environment variables.
 * Local: put it in .env
 * Render: add it in Environment Variables
 */
const ai = new GoogleGenAI({});

// Quick health check
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// Generate quiz endpoint
app.post("/generate-quiz", async (req, res) => {
  try {
    const { topic = "APIs", difficulty = "medium", count = 5 } = req.body ?? {};

    const prompt = `
You are a quiz generator.
Create ${count} multiple-choice questions about "${topic}".
Difficulty: ${difficulty}.

Return ONLY valid JSON exactly in this schema:
{
  "topic": string,
  "difficulty": string,
  "questions": [
    {
      "question": string,
      "choices": [string, string, string, string],
      "answerIndex": 0,
      "explanation": string
    }
  ]
}
No extra text. No markdown. No code fences.
`;

    const resp = await ai.models.generateContent({
      // Use the same model that worked for your test script.
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    // Some models still occasionally wrap JSON in ```...```; strip just in case.
    const text = (resp.text ?? "")
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({
      error: "Failed to generate quiz",
      details: err?.message || String(err),
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
