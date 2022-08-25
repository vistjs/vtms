import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import type { NextApiRequestWithContext } from '@/types/index';

import conn from '@/lib/mongoose';
import UserModel, { IUser, ResponseUser } from '@/models/user';
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
    const { offset = 0, limit = 10 } = handlePagination(current, pageSize);
    const filter = generateQueryFilter(req?.query);
    await conn();
    const [rawUsers, allRoles] = await Promise.all([
      UserModel.find(filter).skip(offset).limit(limit).lean(),
      RoleModel.find().lean(),
    ]);
    const users = addRoleNameToUser(
      rawUsers as ResponseUser[],
      allRoles as IRole[],
    )?.map((user) => ({
      ...user,
      _id: undefined,
      salt: undefined,
      hash: undefined,
    }));
    const total = users?.length;
    normalizeSuccess(res, { list: users, total });
  } catch (err: any) {
    normalizeError(res, err?.message);
  }
});

export default handler;
