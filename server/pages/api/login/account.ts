import type { NextApiResponse } from 'next';
import { serialize } from 'cookie';
import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';

import type { NextApiRequestWithContext } from '@/types/index';

import auth, { sessionOpts } from '@/middleware/auth';
import passport from '@/middleware/auth-utils/passport';
import { createLoginSession } from '@/middleware/auth-utils/auth';
import { ERROR_NUMBER } from '@/constant/index';

const handler = nextConnect();

// handler.use(auth);
handler.use(passport.initialize());

handler.post(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  passport.authenticate('local', async (_, user, info) => {
    const { name, cookie: cookieOpts, secret } = sessionOpts;
    if (user) {
      if (cookieOpts.maxAge && req?.session?.maxAge) {
        req.session.maxAge = cookieOpts.maxAge;
      }
      const token = await createLoginSession(req.session, secret);
      // 登录成功颁发新的token
      res.setHeader('Set-Cookie', serialize(name, token, cookieOpts));
      res.status(HttpStatus.OK).json({
        code: 0,
        message: 'login success !',
      });
    } else {
      res.setHeader(
        'Set-Cookie',
        serialize(name, '', { ...cookieOpts, maxAge: 0 }),
      );
      res.status(HttpStatus.UNAUTHORIZED).json({
        code: ERROR_NUMBER.LOGIN_ERROR,
        message: info?.message || 'login error',
      });
      res.end();
    }
  })(req, res);
});

export default handler;
