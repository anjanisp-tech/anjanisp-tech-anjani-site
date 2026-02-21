import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeWebsite(url: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    You are a world-class digital marketing expert like Neil Patel. 
    Analyze the following website URL: ${url}
    
    Provide a comprehensive SEO and Marketing audit in Markdown format.
    Include:
    1. Overall Score (0-100)
    2. SEO Analysis (On-page, Technical, Backlinks)
    3. Content Strategy Recommendations
    4. Conversion Rate Optimization (CRO) Tips
    5. 3 High-Impact "Quick Wins"
    
    Keep the tone professional, authoritative, and encouraging. Use bullet points and headers.
    If the URL seems invalid or inaccessible, provide a general high-quality marketing strategy for a business in that niche.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze website. Please try again later.");
  }
}
