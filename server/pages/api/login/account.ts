import type { NextApiRequest, NextApiResponse } from 'next';
import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';

import conn from '@/lib/mongoose';
import auth from '@/middleware/auth';
import passport from '@/middleware/auth-utils/passport';

const handler = nextConnect();

handler.use(auth);

handler.post(
  passport.authenticate('local'),
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const {
        // query: { id },
        body: { name, password, roles },
      } = req;
      await conn();
      console.log('req.user in login:', req.user);

      res.status(HttpStatus.OK).json({
        data: {},
        code: 0,
        message: '',
        status: 'ok',
        currentAuthority: 'admin',
        type: 'account',
      });
    } catch (err: any) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: err?.message });
    }
  },
);

export default handler;
