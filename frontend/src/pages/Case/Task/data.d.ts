export type Member = {
  avatar: string;
  username: string;
  _id: string;
};

export type CardListItemDataType = {
  seq: number;
  name: string;
  status: 'normal' | 'exception' | 'active' | 'success';
  logo: string;
  updatedAt: number;
  createdAt: number;
  desc: string;
  members: string[];
  owners: string[];
};
