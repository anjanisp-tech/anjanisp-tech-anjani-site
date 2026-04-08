import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeWebsite(url: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please add it to AI Studio Secrets.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze website. Please try again later.");
  }
}
