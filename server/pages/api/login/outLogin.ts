import type { NextApiRequest, NextApiResponse } from 'next';
import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';
import { serialize } from 'cookie';

import { sessionOpts } from '@/middleware/auth';

const handler = nextConnect();

const { name, cookie: cookieOpts } = sessionOpts;

handler.post(async (_: NextApiRequest, res: NextApiResponse) => {
  try {
    res.setHeader(
      'Set-Cookie',
      serialize(name, '', { ...cookieOpts, maxAge: 0 }),
    );
    res
      .status(HttpStatus.OK)
      .json({ data: {}, code: 0, message: 'logout success !' });
  } catch (err: any) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: err?.message });
  }
});

export default handler;
