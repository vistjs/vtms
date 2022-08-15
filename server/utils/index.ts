import Sequence from '@/models/sequence';
import { PROJECT_SQ, USER_SQ, ROLE_SQ } from '@/constant/index';

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

export function handlePagination(page?: any, limit?: any) {
  if (page && typeof page === 'string' && typeof parseInt(page) === 'number') {
    page = parseInt(page);
  }
  if (
    limit &&
    typeof limit === 'string' &&
    typeof parseInt(limit) === 'number'
  ) {
    limit = parseInt(limit);
  }
  return {
    page,
    limit,
  } as {
    page: number;
    limit: number;
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
