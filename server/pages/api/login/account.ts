import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import Project from '@/models/project';
import UserModel, { IUser } from '@/models/user';
import auth from '../../../middleware/auth';
import passport from '../../../middleware/auth-utils/passport';

import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';
import { PROJECT_STATUS } from '@/constant/index';

import { newUserSeq } from '@/utils/index';

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
      console.log('req login:', req.body);

      res.status(HttpStatus.OK).json({
        data: {},
        code: 0,
        message: '',
        status: 'ok',
        currentAuthority: 'admin',
        type: 'account',
      });
    } catch (err: any) {
      console.log('err:', err);
      res.status(HttpStatus.BAD_REQUEST).json({ error: 'ffff' });
    }
  },
);

export default handler;
