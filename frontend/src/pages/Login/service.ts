import { request } from '@umijs/max';

/** 退出登录接口 */
export async function logout(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/v1/account/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 */
export async function login(body: Auth.LoginParams, options?: { [key: string]: any }) {
  return request<Auth.LoginResult>('/api/v1/account/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
