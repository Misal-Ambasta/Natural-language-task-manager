import nlp from "compromise";
import { ParsedTask, ParsingResult } from "../types/Task.js";

// Simple date parsing function to replace chrono-node
function parseDate(text: string): string | null {
  // Define pattern type
  type DatePattern = {
    regex: RegExp;
    groups?: [number, number, number];
    monthNameToNumber?: boolean;
  };

  // Simple regex patterns for date formats
  const datePatterns: DatePattern[] = [
    // YYYY-MM-DD
    { regex: /(\d{4})-(\d{1,2})-(\d{1,2})/, groups: [1, 2, 3] },
    // MM/DD/YYYY
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, groups: [3, 1, 2] },
    // DD/MM/YYYY
    { regex: /(\d{1,2})\.(\d{1,2})\.(\d{4})/, groups: [3, 2, 1] },
    // Month DD, YYYY
    { regex: /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*|\s+)(\d{4})/, monthNameToNumber: true }
  ];

  // Common date references
  const relativeDates: Record<string, number> = {
    "today": 0,
    "tomorrow": 1,
    "day after tomorrow": 2,
    "next week": 7,
    "next month": 30,
    "next year": 365
  };

  // Check for relative dates
  for (const [phrase, daysToAdd] of Object.entries(relativeDates)) {
    if (text.toLowerCase().includes(phrase)) {
      const today = new Date();
      today.setDate(today.getDate() + daysToAdd);
      return today.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
  }

  // Check for specific date patterns
  for (const pattern of datePatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      if (pattern.monthNameToNumber) {
        // Handle month names
        const monthNames: Record<string, number> = {
          "jan": 1, "january": 1,
          "feb": 2, "february": 2,
          "mar": 3, "march": 3,
          "apr": 4, "april": 4,
          "may": 5,
          "jun": 6, "june": 6,
          "jul": 7, "july": 7,
          "aug": 8, "august": 8,
          "sep": 9, "september": 9,
          "oct": 10, "october": 10,
          "nov": 11, "november": 11,
          "dec": 12, "december": 12
        };
        
        if (match[1] && match[2] && match[3]) {
          const monthName = match[1].toLowerCase();
          const day = parseInt(match[2], 10);
          const year = parseInt(match[3], 10);
          const month = monthNames[monthName.substring(0, 3)];
          
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
      } else if (pattern.groups) {
        // Handle numeric formats
        const year = parseInt(match[pattern.groups[0]], 10);
        const month = parseInt(match[pattern.groups[1]], 10);
        const day = parseInt(match[pattern.groups[2]], 10);
        
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
      }
    }
  }

  return null;
}

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

function extractTaskName(input: string): string {
  let taskName = input.trim();

  // Remove priority indicators
  taskName = taskName.replace(priorityRegex, "").trim();

  // Remove date references (common date formats)
  taskName = taskName.replace(/\b\d{4}-\d{1,2}-\d{1,2}\b/, "").trim(); // YYYY-MM-DD
  taskName = taskName.replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/, "").trim(); // MM/DD/YYYY
  taskName = taskName.replace(/\b\d{1,2}\.\d{1,2}\.\d{4}\b/, "").trim(); // DD.MM.YYYY
  
  // Remove month names with dates
  const monthPattern = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*|\s+)\d{4}\b/gi;
  taskName = taskName.replace(monthPattern, "").trim();
  
  // Remove time references
  taskName = taskName.replace(/\b\d{1,2}(?::|\s*)\d{2}\s*(?:am|pm|AM|PM)?\b/, "").trim();
  
  // Remove relative date references
  const relativeDateTerms = ["today", "tomorrow", "day after tomorrow", "next week", "next month", "next year"];
  for (const term of relativeDateTerms) {
    taskName = taskName.replace(new RegExp(`\\b${term}\\b`, 'gi'), "").trim();
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

    // Extract dates using our custom parseDate function
    const dueDate = parseDate(input);
    let dueTime: string | null = null;
    
    // Simple time extraction using regex
    const timeMatch = input.match(/\b(\d{1,2})(?::|(\s*))?(\d{2})\s*(am|pm|AM|PM)?\b/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[3];
      const ampm = timeMatch[4]?.toLowerCase();
      
      // Convert to 24-hour format if AM/PM is specified
      if (ampm === 'pm' && hours < 12) {
        hours += 12;
      } else if (ampm === 'am' && hours === 12) {
        hours = 0;
      }
      
      dueTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
      confidence += 0.1;
    }
    
    if (dueDate) confidence += 0.1;

    // Extract assignee
    const assignee = extractAssignee(input);
    if (assignee) confidence += 0.1;

    // Extract task name (main description)
    const taskName = extractTaskName(input);

    const task: ParsedTask = {
      taskName,
      assignee,
      dueDate,
      dueTime,
      priority,
      status: "pending",
      completed: false,
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
