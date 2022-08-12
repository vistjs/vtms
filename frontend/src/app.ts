import HttpStatus from 'http-status-codes';

import type { RequestConfig } from '@umijs/max';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { FormattedMessage, history, SelectLang, useIntl, useModel } from '@umijs/max';

import defaultSettings from '../config/defaultSettings';
import { ERROR_NUMBER } from '@/constants';
import { message } from 'antd';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';

const loginPath = '/user/login';

export const request: RequestConfig = {
  timeout: 1000,
  // other axios options you want
  errorConfig: {
    errorHandler() {},
    errorThrower() {},
  },
  requestInterceptors: [],
  responseInterceptors: [
    [
      (response) => {
        // TODO: 增加http status === 200的其他错误处理
        return response;
      },
      (resErr) => {
        if (resErr?.response) {
          const { data, status } = resErr.response;
          if (status === HttpStatus.UNAUTHORIZED) {
            if (data?.code === ERROR_NUMBER.LOGIN_ERROR) {
              message.error(data?.message);
            }
            history.push(loginPath);
          }
        }
        return resErr;
      },
    ],
  ],
};

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    console.log('----444-------');
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}
