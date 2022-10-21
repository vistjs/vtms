import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Task from '@/models/task';
import nextConnect from 'next-connect';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';

const handler = nextConnect();

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      query: { cid },
    } = req;

    if (!cid) {
      throw new Error('cid is required');
    }
    await conn();
    const doc = await Task.findOne({ case: cid }).populate('case').lean();
    if (!doc) {
      normalizeSuccess(res, { total: 0, passed: 0, failed: 0 });
      return;
    }
    const caseTasks = { ...doc };
    caseTasks.case = doc.case.name;
    caseTasks.results.master.branch = 'master';
    caseTasks.results = Object.values(caseTasks.results).map((item: any) => {
      item.screenshots = undefined;
      return item;
    });
    caseTasks.total = caseTasks.results.reduce(
      (previousValue: number, currentValue: any) =>
        previousValue + currentValue.total,
      0,
    );
    caseTasks.passed = caseTasks.results.reduce(
      (previousValue: number, currentValue: any) =>
        previousValue + currentValue.passed,
      0,
    );
    caseTasks.failed = caseTasks.results.reduce(
      (previousValue: number, currentValue: any) =>
        previousValue + currentValue.failed,
      0,
    );
    normalizeSuccess(res, caseTasks);
  } catch (err: any) {
    normalizeError(res, err.message);
  }
});

export default handler;
