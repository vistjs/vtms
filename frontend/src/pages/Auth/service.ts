// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { CardListItemDataType } from '../../pages/Project/List/data';

const API_PREFIX = '/api/v1';
/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: Auth.User;
  }>('/api/v1/user/current', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/v1/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: Auth.LoginParams, options?: { [key: string]: any }) {
  return request<Auth.LoginResult>('/api/v1/login/account', {
    // return request<API.LoginResult>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**获取用户 */
export async function getUsers(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<Auth.User>(`${API_PREFIX}/user/users`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**增加用户 */
export async function addUser(data: { [key: string]: any }) {
  return request<Auth.AddUser>('/api/v1/user/create', {
    method: 'POST',
    data,
  });
}

/**删除用户 */
export async function deleteUser(data: { [key: string]: any }) {
  return request<Auth.User>('/api/v1/user/delete', {
    method: 'DELETE',
    data,
  });
}

export async function updateUser(data: { [key: string]: any }) {
  return request<Auth.User>('/api/v1/user/update', {
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
  return request<Auth.Role>(`${API_PREFIX}/role/roles`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function addRole(data: { [key: string]: any }) {
  return request<Auth.Role>('/api/v1/role/create', {
    method: 'POST',
    data,
  });
}

export async function updateRole(data: { [key: string]: any }) {
  return request<Auth.Role>('/api/v1/role/create', {
    method: 'POST',
    data,
  });
}
