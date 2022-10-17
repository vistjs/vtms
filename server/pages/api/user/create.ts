import type { NextApiRequest, NextApiResponse } from 'next';
import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';

import conn from '@/utils/mongoose';
import UserModel from '@/models/user';
import { createUser } from '@/middleware/auth_utils/auth';
import userIsAdminAuth from '@/middleware/user';
import auth from '@/middleware/auth';
import { normalizeSuccess, normalizeError } from '@/utils';

const handler = nextConnect();

handler.use(auth);
handler.use(userIsAdminAuth);

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      body: { username, password, isAdmin },
    } = req;
    await conn();
    const user = createUser({
      username,
      password,
      name: username.replace(username[0], username[0].toUpperCase()),
    });
    await UserModel.create({ ...user, isAdmin });
    normalizeSuccess(res, null, 'created success !');
  } catch (err: any) {
    normalizeError(res, err?.message);
  }
});

export default handler;
