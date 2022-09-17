import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import UserModel from '@/models/user';
import auth from '@/middleware/auth';
import userIsAdminAuth from '@/middleware/user';

import nextConnect from 'next-connect';
import { normalizeSuccess, normalizeError } from '@/utils';
import { createUserSaltHash } from '@/middleware/auth-utils/auth';

const handler = nextConnect();

handler.use(auth);
handler.use(userIsAdminAuth);

const PasswordReg = /^[\w-!?$%@*&]{5,}$/;

handler.put(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      body: { username, isAdmin, _id, password },
    } = req;
    await conn();
    const updateData = {
      isAdmin,
    };
    if (password && PasswordReg.test(password)) {
      Object.assign(updateData, { ...createUserSaltHash(password) });
    }
    const { matchedCount } = await UserModel.updateOne(
      { username },
      {
        $set: updateData,
      },
    );
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
