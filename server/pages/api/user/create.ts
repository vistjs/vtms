import type { NextApiRequest, NextApiResponse } from 'next';
import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';

import conn from '@/lib/mongoose';
import UserModel from '@/models/user';
import { newUserSeq } from '@/utils/index';
import { createUser } from '@/middleware/auth-utils/auth';
import auth from '@/middleware/auth';

const handler = nextConnect();

handler.use(auth);

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      body: { username, password, roles },
    } = req;
    await conn();
    const seqId = await newUserSeq();
    const user = createUser({ username, password, name: '' });
    await UserModel.create({ ...user, id: seqId });
    res
      .status(HttpStatus.OK)
      .json({ data: {}, code: 0, message: 'created success !' });
  } catch (err: any) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: err?.message });
  }
});

export default handler;
