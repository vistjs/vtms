import { request } from '@umijs/max';
import { CaseList, categoryResult, Sorter } from './constants';

export async function getCases(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: {
    lastRun?: Sorter;
    updateAt?: Sorter;
  },
) {
  return request<CaseList>('/api/v1/case', {
    method: 'GET',
    params: {
      ...params,
      ...(options || {}),
    },
  });
}

export async function updateCase(data: { [key: string]: any }) {
  return request('/api/v1/case', {
    method: 'PUT',
    data,
  });
}

export async function deleteCase(id: string) {
  return request<Record<string, any>>('/api/v1/case', {
    method: 'DELETE',
    data: {
      id,
    },
  });
}

export async function getCategories(projectId: string) {
  return request<categoryResult>('/api/v1/category', {
    method: 'GET',
    params: {
      projectId,
    },
  });
}

export async function addCategory(title: string, parentId: string) {
  return request<categoryResult>('/api/v1/category', {
    method: 'POST',
    data: {
      title,
      parentId,
    },
  });
}

export async function updateCategory(title: string, id: string) {
  return request<categoryResult>('/api/v1/category', {
    method: 'PUT',
    data: {
      title,
      id,
    },
  });
}

export async function deleteCategory(id: string) {
  return request<categoryResult>('/api/v1/category', {
    method: 'DELETE',
    data: {
      id,
    },
  });
}
