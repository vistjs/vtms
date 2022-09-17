export enum ROLE_TYPE {
  admin = 1,
  owner,
  member,
}

export interface IRole {
  id: string;
  name: string;
  type: ROLE_TYPE;
  project_id: string;
}
