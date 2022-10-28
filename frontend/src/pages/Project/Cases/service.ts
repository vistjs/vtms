import { request } from '@umijs/max';
import { CaseList, categoryResult, Sorter } from './types';

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
    updatedAt?: Sorter;
  },
) {
  return request<CaseList>('/api/v1/cases', {
    method: 'GET',
    params: {
      ...params,
      ...(options || {}),
    },
  });
}

export async function updateCase(id: string, data: { [key: string]: any }) {
  return request(`/api/v1/cases/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteCase(id: string) {
  return request<Record<string, any>>(`/api/v1/cases/${id}`, {
    method: 'DELETE',
  });
}

export async function getCategories(projectId: string) {
  return request<categoryResult>('/api/v1/categories', {
    method: 'GET',
    params: {
      projectId,
    },
  });
}

export async function addCategory(title: string, parentId: string) {
  return request<categoryResult>(`/api/v1/categories/${parentId}`, {
    method: 'POST',
    data: {
      title,
    },
  });
}

export async function updateCategory(title: string, id: string) {
  return request<categoryResult>(`/api/v1/categories/${id}`, {
    method: 'PUT',
    data: {
      title,
    },
  });
}

export async function deleteCategory(id: string) {
  return request<categoryResult>(`/api/v1/categories/${id}`, {
    method: 'DELETE',
  });
}
