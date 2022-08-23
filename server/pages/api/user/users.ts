import type { NextApiRequest, NextApiResponse } from 'next';
import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';

import type { NextApiRequestWithContext } from '@/types/index';

import conn from '@/lib/mongoose';
import UserModel, { IUser } from '@/models/user';
import RoleModel, { IRole } from '@/models/role';
import auth from '@/middleware/auth';
import { handlePagination, generateQueryFilter } from '@/utils/index';
import { normalizeSuccess, normalizeError } from '@/utils';

const handler = nextConnect();

handler.use(auth);

function addRoleNameToUser(users: any[], roles: any[]) {
  const roleIdMap = new Map();
  roles?.forEach((role) => {
    const { id: roleId } = role;
    if (!roleIdMap.has(roleId)) {
      roleIdMap.set(roleId, role);
    }
  });
  users.forEach((user) => {
    user.roles = user.roles.map((roleId) => {
      return roleIdMap.get(roleId);
    });
  });
  return users;
}

handler.get(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  try {
    const {
      query: { current, pageSize },
    } = req;
    console.log('query:', req?.query);
    console.log('req.user user in users api:', req.user);
    const { page = 1, limit = 10 } = handlePagination(current, pageSize);
    const filter = generateQueryFilter(req?.query);
    await conn();
    const [rawUsers, allRoles] = await Promise.all([
      UserModel.find(filter)
        .skip((page - 1) * limit)
        .lean(),
      RoleModel.find().lean(),
    ]);
    const users = addRoleNameToUser(rawUsers, allRoles);
    const total = users?.length;
    normalizeSuccess(res, { list: users, total });
  } catch (err: any) {
    normalizeError(res, err?.message);
  }
});

export default handler;
