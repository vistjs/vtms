import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import type { NextApiRequestWithContext } from '@/types/index';
import conn from '@/utils/mongoose';
import auth from '@/middleware/auth';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';

const handler = nextConnect();

handler.use(auth);

handler.get(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  try {
    const {
      query: { current, pageSize },
    } = req;
    const user = req?.user;
    if (user) {
      await conn();
      const { username, name, isAdmin, _id, roles } = user;
      normalizeSuccess(res, {
        user: { username, name, isAdmin, _id, roles },
      });
    } else {
      normalizeSuccess(res, {});
    }
  } catch (err: any) {
    normalizeError(res, err?.message);
  }
});

export default handler;
