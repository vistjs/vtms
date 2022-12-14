import { request } from '@umijs/max';
import { CaseTask } from './types';

export async function getTasks(cid?: string) {
  return request<CaseTask>('/api/tasks', {
    method: 'GET',
    params: {
      cid,
    },
  });
}

export async function coverMaster(cid?: string, branch?: string) {
  return request<any>(`/api/tasks/cover`, {
    method: 'GET',
    params: {
      cid,
      branch,
    },
  });
}
