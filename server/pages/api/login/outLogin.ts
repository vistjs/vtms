import type { NextApiRequest, NextApiResponse } from 'next';
import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';
import { serialize } from 'cookie';

import { sessionOpts } from '@/middleware/auth';
import { normalizeSuccess, normalizeError } from '@/utils';

const handler = nextConnect();

const { name, cookie: cookieOpts } = sessionOpts;

handler.post(async (_: NextApiRequest, res: NextApiResponse) => {
  try {
    res.setHeader(
      'Set-Cookie',
      serialize(name, '', { ...cookieOpts, maxAge: 0 }),
    );
    normalizeSuccess(res, null, 'logout success !');
  } catch (err: any) {
    normalizeError(res, err?.message);
  }
});

export default handler;
