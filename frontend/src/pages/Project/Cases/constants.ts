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
};

export type CaseList = {
  data?: {
    total?: number;
    list?: CaseListItem[];
  };
};

export enum caseStatus {
  NOTACTIVE,
  ACTIVE,
  RUNNING,
  ERROR,
  DELETE,
}

export const caseStatusText = {
  [caseStatus.NOTACTIVE]: '未启动',
  [caseStatus.ACTIVE]: '启用',
  [caseStatus.RUNNING]: '运行中',
  [caseStatus.ERROR]: '错误',
  [caseStatus.DELETE]: '删除',
};

export type Sorter = 'ascend' | 'descend';

export type category = {
  _id: string;
  title: string;
  children?: category[];
};

export enum RecordType {
  'MOUSE',
  'INPUT',
  'DRAG',
  'EVENT',
  'SCROLL',
  'CAPTURE',
}

export type categoryResult = {
  data: category;
};
