import type { NextApiRequest, NextApiResponse } from 'next';
import { IUser } from '@/models/user';
import { HydratedDocument } from 'mongoose';

export type NextApiRequestWithFile = NextApiRequest & {
  files: any;
};

export type NextApiRequestWithContext = NextApiRequest & {
  user?: HydratedDocument<IUser>;
  session?: { [key: string]: any };
};
