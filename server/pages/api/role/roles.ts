import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import RoleModel, { IRole } from '@/models/role';
import auth from '@/middleware/auth';

import nextConnect from 'next-connect';
import { normalizeSuccess, normalizeError } from '@/utils';

const handler = nextConnect();

handler.use(auth);

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      // query: { id },
      body: { name, password, roles },
    } = req;
    console.log('req.user in role api:', req.user);
    await conn();
    const docs = await RoleModel.find().lean();
    normalizeSuccess(res, { list: docs, total: docs.length });
  } catch (err: any) {
    normalizeError(res, 'get roles failed');
  }
});

export default handler;
