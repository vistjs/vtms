// @ts-ignore
/* eslint-disable */

declare namespace Auth {
  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  interface AddUser {
    username: string;
    password: string;
  }

  interface User {
    id: string;
    name: string;
    password: string;
    username?: string;
    roles?: Role[];
  }

  interface Role {
    id: string;
    name: string;
    type: ROLE_TYPE;
    project_id: string;
    users?: User[];
  }

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };
}
