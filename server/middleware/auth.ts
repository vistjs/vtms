import type { CookieSerializeOptions } from 'cookie';
import nextConnect from 'next-connect';

import passport from './auth-utils/passport';
import session from './auth-utils/session';

export const sessionOpts = {
  name: 'codeless-sso',
  secret: 'token_secret_1#token_secret_2#codeless',
  cookie: {
    maxAge: 60 * 60 * 8, // 8 hours,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  } as CookieSerializeOptions,
};

const auth = nextConnect()
  .use(session(sessionOpts))
  .use(passport.initialize())
  .use(passport.session());

export default auth;
