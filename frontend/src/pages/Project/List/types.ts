export type Member = {
  avatar: string;
  username: string;
  _id: string;
};

export interface ProjectPostData {
  name: string;
  desc: string;
  logo: string;
  members: string;
  owners: string;
}

export type CardListItemDataType = {
  seq: number;
  name: string;
  logo: string;
  updatedAt: number;
  createdAt: number;
  desc: string;
  members: string[];
  owners: string[];
};
