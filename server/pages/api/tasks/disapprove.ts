import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Task from '@/models/task';
import nextConnect from 'next-connect';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';
import { base642Img } from '@/utils/common';

const handler = nextConnect();

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      body: { cid, branch, ids },
    } = req;

    if (!cid) {
      throw new Error('cid is required');
    }
    if (!branch) {
      throw new Error('branch is required');
    } else if (branch === 'master') {
      throw new Error('branch can not be master');
    }
    if (!ids || !ids.length) {
      throw new Error('ids should be number array');
    }
    await conn();
    const doc = await Task.findOne({ case: cid });
    if (!doc || !doc.results[branch as string]) {
      throw new Error('branch do not exist');
    }
    const result = { ...doc.results[branch as string] };
    const failed = ids.filter((id: number) => {
      if (result.screenshots[id]) {
        result.screenshots[id].passed = false;
        return true;
      }
      return false;
    });
    result.failed = result.failed + failed.length;
    result.passed = result.total - result.failed;
    result.updateAt = new Date();
    doc.set(`results.${branch}`, result);
    await doc.save();
    normalizeSuccess(res, { failed });
  } catch (err: any) {
    normalizeError(res, err.message);
  }
});

export default handler;
