
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Inline prompt builder: cleans user input and returns a detailed instruction.
const buildCodePrompt = (userInput, language) => {
  let cleanedPrompt = userInput.trim();
 
  if (cleanedPrompt.startsWith('//')) {
    cleanedPrompt = cleanedPrompt.substring(2).trim();
  }
  
  return `You are a code generation assistant. Generate a ${language} function that ${cleanedPrompt}. Return only the code snippet without any additional explanation, comments, or text or example.Only give the code asked for.

Code:`;
};

router.post('/generate-snippet', async (req, res) => {
  const { prompt: userInput, language } = req.body;
  const finalPrompt = buildCodePrompt(userInput, language);

  console.log("Final Prompt sent to Gemini API:", finalPrompt);

  try {
    // Start a chat session with the Gemini model
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    const result = await chatSession.sendMessage(finalPrompt);
    const generatedText = result.response.text();
    console.log("Generated Text from Gemini API:", generatedText);
    // Return the result in an array for consistency with previous format
    res.json([{ generated_text: generatedText }]);
  } catch (error) {
    console.error("Error generating snippet with Gemini:", error);
    res.status(500).json({ error: "Error generating snippet", details: error.message });
  }
});

module.exports = router;
