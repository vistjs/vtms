import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import UserModel from '@/models/user';
import auth from '@/middleware/auth';

import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';
import { normalizeSuccess, normalizeError } from '@/utils';

const handler = nextConnect();

handler.use(auth);

handler.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      body: { id },
    } = req;
    await conn();
    const { deletedCount } = await UserModel.deleteOne({ id });
    if (deletedCount) {
      normalizeSuccess(res, { id }, 'delete success.');
    } else {
      normalizeSuccess(res, { id }, `not found ${id}.`);
    }
  } catch (err: any) {
    normalizeError(res, err?.message);
  }
});

export default handler;
