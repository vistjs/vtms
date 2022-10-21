import Sequence from '@/models/sequence';
import { PROJECT_SQ, ErrorCode } from '@/constant';
import { NextApiRequestWithContext } from '@/types';
import { ResponseUser } from '@/models/user';
import { IRole } from '@/models/role';

export async function newProjectSeq() {
  let seqId = 1;
  let seq = await Sequence.findOne({ name: PROJECT_SQ }).lean();
  if (seq) {
    seqId = seq.seq.length + 1;
    await Sequence.updateOne({ name: PROJECT_SQ }, { $push: { seq: 1 } });
  } else {
    await Sequence.create({ name: PROJECT_SQ, seq: [1] });
  }
  return seqId;
}

export function addRoleNameToUser(
  users: ResponseUser[],
  roles: IRole[],
): ResponseUser[] {
  const roleIdMap = new Map();
  roles?.forEach((role) => {
    const { _id: roleId } = role;
    if (!roleIdMap.has(roleId)) {
      roleIdMap.set(roleId, role);
    }
  });
  users.forEach((user) => {
    user.roles = roles.filter((role) => {
      const isUserRole =
        role?.users?.findIndex((userId) => userId?.equals(user?._id)) > -1;
      return isUserRole;
    });
  });
  return users;
}

export function projectRoleHandle(
  user: NextApiRequestWithContext['user'],
  projectId: string,
) {
  if (user && user.isAdmin === false) {
    let hasPermission = false;
    const { roles } = user;
    if (roles) {
      const role = roles.find((v) => v.project?.toString() === projectId);
      if (role) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      const noPermissionError: Error & {
        code?: ErrorCode;
      } = new Error('NO PERMISSION');
      noPermissionError.code = ErrorCode.NO_PERMISSION;
      throw noPermissionError;
    }
  }
}

export function base642Img(base64: string) {
  return `data:image/png;base64,${base64}`;
}

export function replacePlaceholder(source: string, data: Record<string, any>) {
  return Object.keys(data).reduce((current, key) => {
    return current.replace(new RegExp('\\{\\w+\\}', 'g'), data[key]);
  }, source);
}
