import Sequence from '@/models/sequence';
import { PROJECT_SQ } from '@/constant/index';

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
