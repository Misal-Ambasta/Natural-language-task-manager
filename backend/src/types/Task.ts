export interface ParsedTask {
  _id?: string;
  taskName: string;
  assignee: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
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