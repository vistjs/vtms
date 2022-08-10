import { parse, serialize } from 'cookie';
import HttpStatus from 'http-status-codes';

import { createLoginSession, getLoginSession } from './auth';

function parseCookies(req) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || '');
}

export default function session({ name, secret, cookie: cookieOpts }) {
  return async (req, res, next) => {
    const cookies = parseCookies(req);
    const token = cookies[name];
    let unsealed = {};

    if (token) {
      try {
        // the cookie needs to be unsealed using the password `secret`
        unsealed = await getLoginSession(token, secret);
      } catch (err) {
        // The cookie is invalid or expired
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ code: 0, message: err?.message });
        console.log('----session error----:', err);
        res.end();
      }
    }
    console.log('req token:', token);

    req.session = unsealed;

    // We are proxying res.end to commit the session cookie
    const oldEnd = res.end;
    res.end = async function resEndProxy(...args) {
      if (res.finished || res.writableEnded || res.headersSent) return;
      if (cookieOpts.maxAge) {
        req.session.maxAge = cookieOpts.maxAge;
      }

      const token = await createLoginSession(req.session, secret);
      console.log('new token:', token);
      // 每次请求颁发新的token
      res.setHeader('Set-Cookie', serialize(name, token, cookieOpts));
      oldEnd.apply(this, args);
    };

    next();
  };
}
