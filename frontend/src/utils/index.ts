import { history } from '@umijs/max';
import { stringify } from 'querystring';
import { loginPath } from '@/constants';

export function goLogin() {
  const { search, pathname } = window.location;
  const urlParams = new URL(window.location.href).searchParams;
  /** 此方法会跳转到 redirect 参数所在的位置 */
  const redirect = urlParams.get('redirect');
  // Note: There may be security issues, please note

  if (window.location.pathname !== loginPath && !redirect) {
    history.replace({
      pathname: loginPath,
      search: stringify({
        redirect: pathname + search,
      }),
    });
  }
}
