import * as chrono from "chrono-node";
import nlp from "compromise";
import { ParsedTask, ParsingResult } from "../types/Task";

// Constants
const priorityRegex = /\b(P[1-4]|priority\s*[1-4])\b/i;
const commonNames = [
  "john",
  "jane",
  "mike",
  "sarah",
  "david",
  "emma",
  "alex",
  "lisa",
  "amit",
  "priya",
  "rahul",
  "neha",
  "aman",
  "kavya",
  "rohan",
  "anita",
  "rajeev",
  "sunita",
  "vijay",
  "meera",
  "arjun",
  "pooja",
  "kiran",
  "maya",
];

// Helper functions
function extractPriority(input: string): string {
  const match = input.match(priorityRegex);
  if (!match) return "P3";

  const priorityText = match[0].toLowerCase();
  if (priorityText.includes("1") || priorityText === "p1") return "P1";
  if (priorityText.includes("2") || priorityText === "p2") return "P2";
  if (priorityText.includes("4") || priorityText === "p4") return "P4";
  return "P3";
}

function extractAssignee(input: string): string | null {
  // Try to find names using compromise NLP
  const doc = nlp(input);
  const people = doc.people().out("array");

  // Check if any of the extracted people match our common names list
  for (const person of people) {
    const lowerPerson = person.toLowerCase();
    for (const name of commonNames) {
      if (lowerPerson.includes(name)) {
        // Capitalize first letter of the name
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
  }

  // Look for "@name" pattern
  const atMatch = input.match(/@(\w+)/);
  if (atMatch && atMatch[1]) {
    const name = atMatch[1].toLowerCase();
    if (commonNames.includes(name)) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  // Look for "assign to name" or "assigned to name" pattern
  const assignToMatch = input.match(/assign(?:ed)?\s+to\s+(\w+)/i);
  if (assignToMatch && assignToMatch[1]) {
    const name = assignToMatch[1].toLowerCase();
    if (commonNames.includes(name)) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  return null;
}

function extractTaskName(input: string, chronoResults: any[]): string {
  let taskName = input.trim();

  // Remove priority indicators
  taskName = taskName.replace(priorityRegex, "").trim();

  // Remove date/time references
  if (chronoResults.length > 0) {
    for (const result of chronoResults) {
      const { text } = result;
      taskName = taskName.replace(text, "").trim();
    }
  }

  // Remove assignee references
  for (const name of commonNames) {
    const regex = new RegExp(`@${name}|assign(?:ed)?\\s+to\\s+${name}`, "gi");
    taskName = taskName.replace(regex, "").trim();
  }

  // Clean up any remaining artifacts
  taskName = taskName
    .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
    .replace(/^[\s,.;:!?-]+|[\s,.;:!?-]+$/g, "") // Trim punctuation from start and end
    .trim();

  // If task name is empty after all the cleaning, use a generic task name
  if (!taskName) {
    taskName = "Untitled Task";
  }

  return taskName;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Main parsing function
export async function parseTask(input: string): Promise<ParsingResult> {
  try {
    let confidence = 0.5;
    const originalText = input;

    // Extract priority
    const priority = extractPriority(input);
    if (priority !== "P3") confidence += 0.1;

    // Extract dates and times using chrono
    const chronoResults = chrono.parse(input);
    let dueDate: string | null = null;
    let dueTime: string | null = null;

    if (chronoResults.length > 0) {
      const dateResult = chronoResults[0];
      const parsedDate = dateResult.start.date();
      dueDate = formatDate(parsedDate);

      // If the parsed date has a specific time component
      if (dateResult.start.isCertain("hour")) {
        dueTime = formatTime(parsedDate);
        confidence += 0.1;
      }

      confidence += 0.1;
    }

    // Extract assignee
    const assignee = extractAssignee(input);
    if (assignee) confidence += 0.1;

    // Extract task name (main description)
    const taskName = extractTaskName(input, chronoResults);

    const task: ParsedTask = {
      taskName,
      assignee,
      dueDate,
      dueTime,
      priority,
      confidence,
      originalText,
      parsingMethod: "nlp-packages",
    };

    return {
      success: true,
      task,
      method: "nlp-packages",
    };
  } catch (error) {
    console.error("Error parsing task with NLP packages:", error);
    return {
      success: false,
      task: null,
      error: error instanceof Error ? error.message : String(error),
      method: "nlp-packages",
    };
  }
}
