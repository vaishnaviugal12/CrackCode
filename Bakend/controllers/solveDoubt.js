
      import { GoogleGenAI } from "@google/genai";

const solveDoubt = async (req, res) => {
  try {
    // Validate request body
    const { messages, title, description, testCases, startCode } = req.body;
    
    if (!messages || typeof messages !== 'string') {
      return res.status(400).json({ error: "Messages must be a non-empty string" });
    }

    if (!title || !description || !testCases || !startCode) {
      return res.status(400).json({ error: "Missing required problem context fields" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

    const systemInstruction = `
    You are an expert AI assistant for a coding platform focused on Data Structures and Algorithms (DSA).

    CURRENT PROBLEM CONTEXT:
    [Title]: ${title}
    [Description]: ${description}
    [Test Cases]: ${JSON.stringify(testCases, null, 2)}
    [Start Code]: ${typeof startCode === 'string' ? startCode : JSON.stringify(startCode)}

    STRICT RULES:
    1. ONLY help with this specific problem
    2. Provide hints first (e.g., "Consider using a two-pointer approach")
    3. Explain concepts using the provided test cases
    4. Reveal reference solution ONLY if user explicitly asks with:
       - "show solution"
       - "give me the code"
       - "full answer please"
    5. Never reveal hidden test cases or validation logic
    6. Format all code in markdown blocks

    RESPONSE FORMAT:
    - Hints: "Hint: [guidance]"
    - Explanations: "Approach: [logic explanation]"
    - Solutions: "Solution:\\n\`\`\`[language]\\n[code]\\n\`\`\`"
    - Off-topic: "I can only assist with the current DSA problem."
    `.trim();

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{ text: messages }]
      }],
      generationConfig: {
        temperature: 0.5,  // Lower for more focused responses
        maxOutputTokens: 1024,
      },
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }]
      }
    });

    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ 
        error: "Empty response from Gemini",
        details: "The API returned an empty response"
      });
    }

    res.status(200).json({ 
      response: text,
      problem: { title } // Echo back problem title for reference
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
};

export default solveDoubt;