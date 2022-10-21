export interface Screenshot {
  id: number;
  reference: string;
  test?: string;
  diff?: string;
  passed?: boolean;
}

export interface Report {
  branch: string;
  total: number;
  passed: number;
  failed: number;
  createdAt: string;
  updatedAt: string;
  screenshots: Screenshot[];
}
