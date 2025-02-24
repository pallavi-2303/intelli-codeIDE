// routes/codeAnalysis.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1024,
  responseMimeType: "text/plain",
};

router.post('/analyze-code', async (req, res) => {
  const { codeSnippet } = req.body;
  const prompt = `Analyze the following code. If there are any errors, mistakes, or improvements needed, provide concise bullet points; otherwise, summarize it concisely.

Code:
${codeSnippet}`;
  try {
    const chatSession = model.startChat({ generationConfig, history: [] });
    const result = await chatSession.sendMessage(prompt);
    const analysis = result.response.text();
    res.json({ analysis });
  } catch (error) {
    console.error("Error analyzing code:", error);
    res.status(500).json({ error: "Error analyzing code", details: error.message });
  }
});

module.exports = router;
