import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import UserModel, { IUser } from '@/models/user';
import RoleModel, { IRole } from '@/models/role';
import auth from '../../../middleware/auth';

import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';

const handler = nextConnect();

handler.use(auth);

function addRoleNameToUser(users: any[], roles: any[]) {
  console.log('roles roles:', roles);
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

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      query: { current, pageSize },
    } = req;
    let [offset, limit] = [1, 10];
    if (current && Number.isInteger(+current)) {
      offset = +current;
    }
    if (pageSize && Number.isInteger(+pageSize)) {
      limit = +pageSize;
    }
    await conn();
    const [rawUsers, allRoles] = await Promise.all([
      UserModel.find()
        .skip((offset - 1) * limit)
        .lean(),
      RoleModel.find().lean(),
    ]);
    const users = addRoleNameToUser(rawUsers, allRoles);
    const total = await UserModel.find().countDocuments();

    res
      .status(HttpStatus.OK)
      .json({ data: { list: users, total }, code: 0, message: '' });
  } catch (err: any) {
    res.status(HttpStatus.BAD_REQUEST).json({ err });
  }
});

export default handler;
