import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Task from '@/models/task';
import nextConnect from 'next-connect';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';
const diffImages = require('@/utils/imgDiff.js');

const handler = nextConnect();
const ExpirationMilliseconds = 1000 * 60 * 60 * 24 * 30;

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
    const doc = await Task.findOne({ case: cid });
    if (!doc || !doc.results[branch as string]) {
      throw new Error('branch do not exist');
    }
    const branchResult = doc.results[branch as string];
    const masterResult = doc.results.master;
    const results: any = {
      master: {
        ...masterResult,
        branch: branchResult.branch,
        updatedAt: new Date(),
        screenshots: branchResult.screenshots.map((item: any) => {
          return { test: item.test };
        }),
      },
      [branch as string]: {
        ...branchResult,
        failed: 0,
        passed: branchResult.total,
        updatedAt: new Date(),
        screenshots: branchResult.screenshots.map((item: any) => {
          const it: any = { test: item.test };
          if (item.diff) {
            it.passed = true;
          }
          return it;
        }),
      },
    };
    const now = Date.now();
    const promises = Object.keys(doc.results).map(async (br: string) => {
      if (branch === br || br === 'master') return { br, expired: true };
      const result: any = doc.results[br];
      if (now - new Date(result.updatedAt).getTime() > ExpirationMilliseconds)
        return { br, expired: true };
      const references = branchResult.screenshots.map(({ test }: any) => test);
      const imageDatas = result.screenshots.map(({ test }: any) => test);
      const diffs = await diffImages(
        references,
        imageDatas,
        doc.width,
        doc.height,
      );
      return { br, diffs };
    });
    for (const promise of promises) {
      const { br, expired, diffs } = await promise;
      if (!expired) {
        const result: any = doc.results[br];
        const failed = diffs.reduce(
          (previousValue: number, currentValue: string) =>
            previousValue + (currentValue.length > 0 ? 1 : 0),
          0,
        );
        results[br] = {
          ...result,
          failed,
          passed: result.total - failed,
          updatedAt: new Date(),
          screenshots: result.screenshots.map((item: any, index: number) => ({
            test: item.test,
            diff: diffs[index] || undefined,
            passed: !diffs[index] || undefined,
          })),
        };
      }
    }
    doc.set(`results`, results);
    await doc.save();
    normalizeSuccess(res, { success: true });
  } catch (err: any) {
    normalizeError(res, err.message);
  }
});

export default handler;
