export const TC_MONGODB_DBNAME = 'codeless_tc';

export enum PROJECT_STATUS {
  enable = 1,
  deleted,
}

export const PROJECT_SQ = 'project_sq';

export const USER_SQ = 'user_sq';

export const ROLE_SQ = 'role_sq';

export enum ROLE_TYPE {
  admin = 1,
  owner,
  member,
}

export const SORTER_ASC = 'ascend';

export const SORTER_DES = 'descend';

export const AUTH_ERROR = {
  SESSION_EXPIRED: 'Session expired',
  INVALID_COOKIE: 'The cookie is invalid',
};
