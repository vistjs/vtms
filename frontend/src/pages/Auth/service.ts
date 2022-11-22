import { request } from '@umijs/max';
import { User, AddUser, Role } from './types';

const API_PREFIX = '/api';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: User;
  }>('/api/user/current', {
    method: 'GET',
    ...(options || {}),
  });
}

/**获取用户 */
export async function getUsersApi(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
    [keyword: string]: any;
  },
  options?: { [key: string]: any },
) {
  return request<User>(`${API_PREFIX}/user/users`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**增加用户 */
export async function addUser(data: { [key: string]: any }) {
  return request<AddUser>('/api/user/create', {
    method: 'POST',
    data,
  });
}

/**删除用户 */
export async function deleteUser(data: { [key: string]: any }) {
  return request<User>('/api/user/delete', {
    method: 'DELETE',
    data,
  });
}

export async function updateUser(data: { [key: string]: any }) {
  return request<User>('/api/user/update', {
    method: 'PUT',
    data,
  });
}

/**获取角色 */
export async function getRoles(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<Role>(`${API_PREFIX}/roles`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
