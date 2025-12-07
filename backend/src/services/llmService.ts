//llmService.ts
//Function:
//This file contains service functions for interacting with a large language model (LLM) to identify skills required for tasks based on their titles.
import { GoogleGenAI } from "@google/genai";
// console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
const genAI = new GoogleGenAI({});
// console.log("GoogleGenerativeAI initialized", genAI);
export async function identifySkills(taskTitle: string): Promise<string[]> {
  try {
    const modelInfo = await genAI.models.get({ model: "gemini-2.0-flash" });
    const prompt = `Given the following task title, identify the required technical skills from this list: [Frontend, Backend or Both].
    
Task title: "${taskTitle}"

Return only the skill names as a JSON array, for example: ["Frontend", "Backend"]
Do not include any explanation, only the JSON array.`;

    const result = await genAI.models.generateContent({
      model: modelInfo.name || "gemini-2.0-flash",
      contents: prompt,
    });
    const text = result.text;
    console.log("LLM response text:", text);
    if (!text) {
      throw new Error("No response from LLM");
    }
    const skillsMatch = text.match(/\[.*?\]/);
    if (skillsMatch) {
      const skills = JSON.parse(skillsMatch[0]);
      return skills;
    }

    return ["Backend"];
  } catch (error) {
    console.error("Error identifying skills with LLM:", error);
    return ["Error identifying skills with LLM"];
  }
}
