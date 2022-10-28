import type { NextApiResponse } from 'next';
import { serialize } from 'cookie';
import nextConnect from 'next-connect';
import type { NextApiRequestWithContext } from '@/types';
import auth, { sessionOpts } from '@/middleware/auth';
import passport from '@/middleware/auth_utils/passport';
import { createLoginSession } from '@/middleware/auth_utils/auth';
import { ErrorCode } from '@/constants';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';

const handler = nextConnect();

handler.use(passport.initialize());

// req.session in set-cookie: {
//   passport: { user: 'admin' },
//   createdAt: 1660210495284,
//   maxAge: 28800
// }

handler.post(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  passport.authenticate('local', async (_, user, info) => {
    const { name, cookie: cookieOpts, secret } = sessionOpts;
    // { passport: { user: 'admin' } }
    if (user) {
      console.log('user in login:', user);
      console.log('start req.session:', req.session);
      const { username } = user;
      if (!req?.session) {
        req.session = {};
      }
      if (username) {
        req.session.passport = { user: username };
      }
      if (cookieOpts.maxAge) {
        req.session.maxAge = cookieOpts.maxAge;
      }
      console.log('final res session in login:', req?.session);
      const token = await createLoginSession(req.session, secret);
      // 登录成功颁发新的token
      res.setHeader('Set-Cookie', serialize(name, token, cookieOpts));
      normalizeSuccess(res, null, 'login success !');
    } else {
      res.setHeader(
        'Set-Cookie',
        serialize(name, '', { ...cookieOpts, maxAge: 0 }),
      );

      normalizeError(
        res,
        info?.message || 'login error',
        ErrorCode.LOGIN_ERROR,
      );
      res.end();
    }
  })(req, res);
});

export default handler;
