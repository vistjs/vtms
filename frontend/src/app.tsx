import { message, notification } from 'antd';
import Footer from './components/Footer';
import RightContent from './components/RightContent';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig, RequestConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { currentUser as queryCurrentUser } from '@/pages/Auth/service';
import { User } from '@/pages/Auth/types';

import { loginPath, ErrorCode } from '@/constants';
import { goLogin } from '@/utils';
const isDev = process.env.NODE_ENV === 'development';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: User;
  loading?: boolean;
  fetchUserInfo?: () => Promise<User | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {} // 未登陆
    return undefined;
  };
  // 如果不是登录页面，执行
  if (window.location.pathname !== loginPath) {
    const { user } = (await fetchUserInfo()) || ({} as any);
    return {
      fetchUserInfo,
      currentUser: user,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

const casesPathReg = /\/project\/([\w\:]+)\/cases/;

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    contentStyle: { padding: 0 },
    footerRender: () => <Footer />,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && window.location.pathname !== loginPath) {
        goLogin();
      }
      // 用例管理调到具体的项目
      if (window.location.pathname.match(casesPathReg)) {
        const projectIdStored = localStorage.getItem('tc-projectId');
        if (RegExp.$1 === ':projectId' && projectIdStored) {
          history.push(`/project/${projectIdStored}/cases`);
        } else {
          localStorage.setItem('tc-projectId', RegExp.$1);
        }
      }
    },
    links: isDev
      ? [
          // <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          //   <LinkOutlined />
          //   <span>OpenAPI 文档</span>
          // </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {window.location?.pathname !== loginPath && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

//与后端约定 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  code: number;
  data: any;
  message: string;
  errorMessage?: string;
  showType?: ErrorShowType;
}

export const request: RequestConfig = {
  // other axios options you want
  errorConfig: {
    // 错误抛出
    errorThrower: (res: ResponseStructure) => {
      const { code, data, errorMessage, showType } = res;
      if (code !== 0) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { code, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      // 请求options里面加了skipErrorHandler就要在请求的catch自行处理
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, code } = errorInfo;
          if (code === ErrorCode.NO_PERMISSION) {
            errorMessage && message.error(errorMessage);
            goLogin();
            return;
          }
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warn(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: code,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        message.error('Response status:' + error.response.status);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },
  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response;
      if (typeof (data as any).code !== 'undefined' && (data as any).code !== 0) {
        request.errorConfig?.errorThrower?.(data);
      }
      return response;
    },
  ],
};
