import type { NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import type { NextApiRequestWithContext } from '@/types/index';

import conn from '@/utils/mongoose';
import UserModel from '@/models/user';
import auth from '@/middleware/auth';
import { normalizeSuccess, normalizeError } from '@/utils';

const handler = nextConnect();

handler.use(auth);

handler.get(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  try {
    await conn();

    const users = await UserModel.find({}).lean();

    const total = users?.length;
    normalizeSuccess(res, { list: users, total });
  } catch (err: any) {
    normalizeError(res, err?.message);
  }
});

export default handler;
