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
  tasks: ParsedTask[] | null;
  error?: string;
  method: "openai" | "nlp-packages";
}


