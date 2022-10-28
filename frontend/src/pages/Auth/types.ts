import { ROLE_TYPE } from './constants';

export type PageParams = {
  current?: number;
  pageSize?: number;
};

export interface AddUser {
  username: string;
  password: string;
  isAdmin: boolean;
}

export interface User {
  name: string;
  password: string;
  username?: string;
  isAdmin: boolean;
  _id: string;
  roles?: Role[];
}

export interface Role {
  id: string;
  name: string;
  type: ROLE_TYPE;
  project_id: string;
  users?: User[];
}
