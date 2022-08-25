import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import UserModel from '@/models/user';
import auth from '@/middleware/auth';
import userIsAdminAuth from '@/middleware/user';

import nextConnect from 'next-connect';
import { normalizeSuccess, normalizeError } from '@/utils';

const handler = nextConnect();

handler.use(auth);
handler.use(userIsAdminAuth);

handler.put(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      body: { username, isAdmin, _id },
    } = req;
    await conn();
    const { matchedCount } = await UserModel.updateOne(
      { username },
      {
        $set: { isAdmin },
      },
    );
    console.log('matchedCount matchedCount', matchedCount);
    if (matchedCount) {
      normalizeSuccess(res, { username }, 'updated success.');
    } else {
      normalizeSuccess(res, { username }, `not found ${username}.`);
    }
  } catch (err: any) {
    normalizeError(res, err?.message);
  }
});

export default handler;
