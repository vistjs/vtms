import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Task from '@/models/task';
import nextConnect from 'next-connect';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';
import { base642Img } from '@/utils/common';

const handler = nextConnect();

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      query: { cid, branch },
    } = req;

    if (!cid) {
      throw new Error('cid is required');
    }
    if (!branch) {
      throw new Error('branch is required');
    }
    await conn();
    const doc = await Task.findOne({ case: cid }).lean();
    if (!doc || !doc.results[branch as string]) {
      throw new Error('branch do not exist');
    }
    const result = doc.results[branch as string];
    if (branch === 'master') {
      result.screenshots = result.screenshots.map((item: any, id: number) => {
        return { id, reference: base642Img(item.test) };
      });
    } else {
      const master = doc.results.master.screenshots;
      result.screenshots = result.screenshots.map((item: any, id: number) => {
        const screenshot: any = {
          id,
          reference: base642Img(master[id].test),
          test: base642Img(item.test),
        };
        if (item.diff) {
          screenshot.diff = base642Img(item.diff);
        }
        if (item.passed) {
          screenshot.passed = item.passed;
        }
        return screenshot;
      });
    }
    normalizeSuccess(res, result);
  } catch (err: any) {
    normalizeError(res, err.message);
  }
});

export default handler;
