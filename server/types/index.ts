import type { NextApiRequest, NextApiResponse } from 'next';
import { IUser } from '@/models/user';

export type NextApiRequestWithFile = NextApiRequest & {
  files: any;
};

export type NextApiRequestWithContext = NextApiRequest & {
  user?: IUser;
  session?: { [key: string]: any };
};
