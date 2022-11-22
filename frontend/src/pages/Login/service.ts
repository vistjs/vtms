import { request } from '@umijs/max';
import { LoginParams, LoginResult } from './types';
/** 退出登录接口 */
export async function logout(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/account/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 */
export async function login(body: LoginParams, options?: { [key: string]: any }) {
  return request<LoginResult>('/api/account/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
