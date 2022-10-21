export interface Result {
  branch: string;
  total: number;
  passed: number;
  failed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CaseTask {
  case: string;
  total: number;
  passed: number;
  failed: number;
  results: Result[];
  createdAt: string;
  updatedAt: string;
}
