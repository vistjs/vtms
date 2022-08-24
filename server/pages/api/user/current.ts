import type { NextApiRequest, NextApiResponse } from 'next';
import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';

import type { NextApiRequestWithContext } from '@/types/index';

import conn from '@/lib/mongoose';
import UserModel, { IUser, DocumentIUser, ResponseUser } from '@/models/user';
import RoleModel, { IRole } from '@/models/role';
import auth from '@/middleware/auth';
import { handlePagination, generateQueryFilter } from '@/utils/index';
import { normalizeSuccess, normalizeError, addRoleNameToUser } from '@/utils';

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
      const allRoles = await RoleModel.find().lean();
      const users = addRoleNameToUser(
        [user as ResponseUser],
        allRoles as IRole[],
      );

      normalizeSuccess(res, { user: users?.[0] });
    } else {
      normalizeSuccess(res, {});
    }
  } catch (err: any) {
    normalizeError(res, err?.message);
  }
});

export default handler;
