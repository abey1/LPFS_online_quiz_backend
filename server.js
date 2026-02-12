import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenAI({});

// Health check
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.post("/generate-quiz", async (req, res) => {
  try {
    // console.log("Has key?", Boolean(process.env.GEMINI_API_KEY));
    const { topic = "JavaScript", difficulty = "medium", count = 5 } = req.body;

    // const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
    Create ${count} multiple choice questions about "${topic}".
    Difficulty: ${difficulty}.
    Return ONLY valid JSON in this format:
    Make the first choice the correct answer in all the questions.
    give it id of random numbers of length 5 digits.

    {
      "questions": [
        {
          "id": 12345,
          "question": "",
          "choices": ["", "", "", ""],
          "explanation": ""
        }
      ]
    }
    `;

    // const result = await model.generateContent(prompt);
    const resp = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    //remove unnessary text and spaces from the response text
    const text = (resp.text ?? "")
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    // const text = result.response.text();

    const parsed = JSON.parse(text);

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
