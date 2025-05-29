import OpenAI from "openai";
import { ParsedTask, ParsingResult } from "../types/Task";

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

// Initialize the OpenAI client
export function initializeOpenAI(apiKey: string): void {
  openaiClient = new OpenAI({
    apiKey: apiKey,
  });
}

// Main parsing function
export async function parseTask(input: string): Promise<ParsingResult> {
  try {
    if (!openaiClient) {
      throw new Error("OpenAI client not initialized. Call initializeOpenAI first.");
    }

    const prompt = `
Parse the following natural language task into structured data. Extract:
1. Task name (the main action/description)
2. Assignee (person's name if mentioned)
3. Due date (convert to YYYY-MM-DD format, use current year if not specified)
4. Due time (convert to HH:MM 24-hour format)
5. Priority (P1, P2, P3, or P4 - default to P3 if not specified)

Input: "${input}"

Respond ONLY with valid JSON in this exact format:
{
  "taskName": "string",
  "assignee": "string or null",
  "dueDate": "YYYY-MM-DD or null",
  "dueTime": "HH:MM or null",
  "priority": "P1|P2|P3|P4",
  "confidence": 0.0-1.0
}

Current date: ${new Date().toISOString().split('T')[0]}
`;

    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a task parsing assistant. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    try {
      const parsedResponse = JSON.parse(content);
      const task: ParsedTask = {
        taskName: parsedResponse.taskName || "Untitled Task",
        assignee: parsedResponse.assignee,
        dueDate: parsedResponse.dueDate,
        dueTime: parsedResponse.dueTime,
        priority: parsedResponse.priority || "P3",
        confidence: parsedResponse.confidence || 0.8,
        originalText: input,
        parsingMethod: "openai",
      };

      return {
        success: true,
        task,
        method: "openai",
      };
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new Error(`Invalid JSON response from OpenAI: ${content}`);
    }
  } catch (error) {
    console.error("OpenAI parsing error:", error);
    return {
      success: false,
      task: null,
      error: error instanceof Error ? error.message : String(error),
      method: "openai",
    };
  }
}