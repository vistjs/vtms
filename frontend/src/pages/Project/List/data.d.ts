export type Member = {
  avatar: string;
  name: string;
  id: string;
};

export type CardListItemDataType = {
  seq: number;
  name: string;
  status: 'normal' | 'exception' | 'active' | 'success';
  logo: string;
  updatedAt: number;
  createdAt: number;
  desc: string;
  members: Member[];
};
