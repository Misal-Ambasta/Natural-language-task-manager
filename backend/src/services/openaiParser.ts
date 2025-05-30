import OpenAI from "openai";
import { ParsedTask, ParsingResult } from "../types/Task.js";

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
You are a task parsing assistant. Your job is to extract multiple tasks from a paragraph of natural language instructions.

For **each task**, extract:
1. taskName (short title of the task)
2. assignee (person's name)
3. dueDate (YYYY-MM-DD format, use current year if not specified)
4. dueTime (HH:MM 24-hour format, null if not present)
5. priority (P1, P2, P3, P4 — default to P3)
6. confidence (0.0 to 1.0 based on how sure you are)

Input:
"${input}"

Respond ONLY with a JSON array like this:
[
  {
    "taskName": "string",
    "assignee": "string",
    "dueDate": "YYYY-MM-DD",
    "dueTime": "HH:MM or null",
    "priority": "P1|P2|P3|P4",
    "confidence": 0.0-1.0
  },
  ...
]

Today's date is: ${new Date().toISOString().split('T')[0]}
`;

    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a task parsing assistant. Always respond with a valid JSON array."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No content in OpenAI response");

    let parsedArray: any[];
    try {
      parsedArray = JSON.parse(content);
      if (!Array.isArray(parsedArray)) throw new Error("Expected JSON array");
    } catch (err) {
      throw new Error("Invalid JSON response: " + content);
    }

    const tasks: ParsedTask[] = parsedArray.map((t) => ({
      taskName: t.taskName || "Untitled Task",
      assignee: t.assignee || null,
      dueDate: t.dueDate || null,
      dueTime: t.dueTime || null,
      priority: t.priority || "P3",
      status: "pending",
      completed: false,
      confidence: t.confidence || 0.8,
      originalText: input,
      parsingMethod: "openai",
    }));

    return {
      success: true,
      tasks, // Changed from single task to an array of tasks
      method: "openai",
    };
  } catch (error) {
    console.error("OpenAI parsing error:", error);
    return {
      success: false,
      tasks: null,
      error: error instanceof Error ? error.message : String(error),
      method: "openai",
    };
  }
}
