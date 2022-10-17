import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import UserModel from '@/models/user';
import auth from '@/middleware/auth';
import userIsAdminAuth from '@/middleware/user';

import nextConnect from 'next-connect';
import { normalizeSuccess, normalizeError } from '@/utils';

const handler = nextConnect();

handler.use(auth);
handler.use(userIsAdminAuth);

handler.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      body: { username },
    } = req;
    await conn();
    const { deletedCount } = await UserModel.deleteOne({ username });
    if (deletedCount) {
      normalizeSuccess(res, { username }, 'delete success.');
    } else {
      normalizeSuccess(res, { username }, `not found ${username}.`);
    }
  } catch (err: any) {
    normalizeError(res, err?.message);
  }
});

export default handler;
