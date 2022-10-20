import { request } from '@umijs/max';
import { CaseList, categoryResult, Sorter } from './constants';

interface Result {
  name: string;
  total: number;
  passed?: number;
  failed?: number;
  createAt: string;
  updateAt: string;
}

interface Task {
  case: string;
  results: {
    [name: string]: Result;
  };
  createAt: string;
  updateAt: string;
}

export async function getTasks(cid: string) {
  return request<Task>('/api/v1/task', {
    method: 'GET',
    params: {
      cid,
    },
  });
}
