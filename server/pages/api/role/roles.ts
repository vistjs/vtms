import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import RoleModel, { IRole } from '@/models/role';
import auth from '@/middleware/auth';

import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';

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
    res
      .status(HttpStatus.OK)
      .json({ data: { list: docs }, code: 0, message: '' });
  } catch (err: any) {
    console.log('err:', err);
    res.status(HttpStatus.BAD_REQUEST).json({ error: 'ffff' });
  }
});

export default handler;
