export type CaseListItem = {
  _id: string;
  name: string;
  status: number;
  steps: any[];
  mocks: any;
  runs: number;
  lastRun?: string;
  url: string;
  width: number;
  height: number;
  lastOperator: {
    name: string;
  };
  category: string;
  updatedAt: string;
  createdAt: string;
  noticeHook?: string;
};

export type CaseList = {
  data?: {
    total?: number;
    list?: CaseListItem[];
  };
};

export type Sorter = 'ascend' | 'descend';

export type category = {
  _id: string;
  title: string;
  children?: category[];
};

export type categoryResult = {
  data: category;
};
