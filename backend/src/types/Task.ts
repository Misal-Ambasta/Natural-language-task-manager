export interface ParsedTask {
  _id?: string;
  taskName: string;
  assignee: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: string;
  status: string;
  completed: boolean;
  confidence: number;
  originalText: string;
  parsingMethod: 'openai' | 'nlp-packages';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ParsingResult {
  success: boolean;
  task: ParsedTask | null;
  error?: string;
  method: 'openai' | 'nlp-packages';
}

// Multiple task parsing result
export interface MultiTaskParsingResult {
  success: boolean;
  tasks: ParsedTask[] | null;
  error?: string;
  method: string;
}

// Union type for both single and multiple task results
export type TaskParsingResult = ParsingResult | MultiTaskParsingResult;

// Type guards to check which type of result we have
export function isSingleTaskResult(result: TaskParsingResult): result is ParsingResult {
  return 'task' in result;
}

export function isMultiTaskResult(result: TaskParsingResult): result is MultiTaskParsingResult {
  return 'tasks' in result;
}