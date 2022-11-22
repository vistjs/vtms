import { request } from '@umijs/max';
import { Report } from './types';

export async function getTask(cid?: string, branch?: string) {
  return request<Report>(`/api/tasks/${branch}`, {
    method: 'GET',
    params: {
      cid,
    },
  });
}

export async function approve(ids: number[], cid?: string, branch?: string) {
  return request<any>(`/api/tasks/approve`, {
    method: 'POST',
    data: {
      cid,
      ids,
      branch,
    },
  });
}

export async function disapprove(ids: number[], cid?: string, branch?: string) {
  return request<any>(`/api/tasks/disapprove`, {
    method: 'POST',
    data: {
      cid,
      ids,
      branch,
    },
  });
}
