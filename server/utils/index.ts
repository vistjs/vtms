import Sequence from '@/models/sequence';
import type { NextApiRequest, NextApiResponse } from 'next';
import HttpStatus from 'http-status-codes';
import {
  PROJECT_SQ,
  USER_SQ,
  ROLE_SQ,
  ErrorCode,
  ErrorShowType,
} from '@/constant';

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

export async function newUserSeq() {
  let seqId = 1;
  let seqDoc = await Sequence.findOne({ name: USER_SQ }).lean();
  if (seqDoc) {
    seqId = seqDoc.seq.length + 1;
    await Sequence.updateOne({ name: USER_SQ }, { $push: { seq: 1 } });
  } else {
    await Sequence.create({ name: USER_SQ, seq: [1] });
  }
  return seqId;
}

export async function newRoleSeq(seqIdCount: number = 1) {
  if (seqIdCount < 0) {
    throw new Error('wrong seq seqIdCount');
  }
  let seqId = 1;
  let seq = await Sequence.findOne({ name: ROLE_SQ }).lean();
  if (seq) {
    seqId = seq.seq?.[0] + seqIdCount;
    await Sequence.updateOne({ name: ROLE_SQ }, { seq: seqId });
  } else {
    await Sequence.create({ name: ROLE_SQ, seq: [1] });
  }
  return seqId;
}

export function handlePagination(
  page?: any,
  limit?: any,
): {
  limit: number;
  offset: number;
} {
  if (page && typeof page === 'string' && typeof parseInt(page) === 'number') {
    page = parseInt(page);
  } else {
    page = 1;
  }
  if (
    limit &&
    typeof limit === 'string' &&
    typeof parseInt(limit) === 'number'
  ) {
    limit = parseInt(limit);
  } else {
    limit = 10;
  }
  return {
    limit,
    offset: (page - 1) * limit,
  };
}

export function generateQueryFilter(params: { [key: string]: any }) {
  let filter: { [key: string]: any } = {};
  if (params) {
    Object.keys(params).forEach((itemKey) => {
      if (params[itemKey] == undefined) {
        return;
      }
      filter[itemKey] = params[itemKey];
    });
  }
  return filter;
}

interface ResponseStructure {
  data: any;
  code: ErrorCode;
  message: string;
  errorMessage?: string;
  showType?: ErrorShowType;
}

export function normalizeResult(
  data: any,
  code: ErrorCode,
  message = '',
  errorMessage?: string,
  showType?: ErrorShowType,
): ResponseStructure {
  const res: ResponseStructure = { data, code, message };
  if (typeof errorMessage !== 'undefined') {
    res.errorMessage = errorMessage;
  }
  if (typeof showType !== 'undefined') {
    res.showType = showType;
  }
  return res;
}

export function normalizeSuccess(
  res: NextApiResponse,
  data: any,
  message = '',
) {
  res.status(HttpStatus.OK).json(normalizeResult(data, ErrorCode.SUCCESS));
}

export function normalizeError(
  res: NextApiResponse,
  errorMessage = '',
  code = ErrorCode.COMMON_ERROR,
  showType = ErrorShowType.ERROR_MESSAGE,
) {
  res
    .status(HttpStatus.OK)
    .json(normalizeResult(null, code, '', errorMessage, showType));
}

export function addRoleNameToUser(
  users: ResponseUser[],
  roles: IRole[],
): ResponseUser[] {
  const roleIdMap = new Map();
  roles?.forEach((role) => {
    const { id: roleId } = role;
    if (!roleIdMap.has(roleId)) {
      roleIdMap.set(roleId, role);
    }
  });
  users.forEach((user) => {
    user.roles = roles.filter((role) => {
      return role.users?.includes(user._id);
    });
  });
  return users;
}
