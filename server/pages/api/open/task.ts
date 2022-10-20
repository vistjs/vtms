import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Case, { CaseStatus } from '@/models/case';
import nextConnect from 'next-connect';
import Project from '@/models/project';
import Category from '@/models/category';
import Task from '@/models/task';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';
import { runTask } from '@/utils/runPuppeteer';
const diffImages = require('@/utils/imgDiff.js');
import Cors from 'cors';

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD', 'PUT'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function,
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const handler = nextConnect();

interface RunResult {
  caseId: string;
  isError: boolean;
  errorMsg?: string;
  total: number;
  success?: number;
  failed?: number;
}

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      query: { pid, cid, commit },
    } = req;

    await conn();
    if (!commit) {
      throw new Error('parameter error, need commit');
    } else if (commit === 'baseline') {
      throw new Error('parameter error, commit can not be baseline');
    }
    let caseInstances;
    if (pid) {
      const project = await Project.findOne({
        seq: pid,
      });
      if (!project) {
        throw new Error('project do not exist');
      }
      caseInstances = await Case.find({
        project: project._id,
        status: {
          $in: [CaseStatus.ACTIVE, CaseStatus.RUNNING, CaseStatus.ERROR],
        },
      }).lean();
    } else if (cid) {
      const category = await Category.findOne({
        _id: cid,
      });
      if (!category) {
        throw new Error('category do not exist');
      }
      caseInstances = await Case.find({
        category: category._id,
        status: {
          $in: [CaseStatus.ACTIVE, CaseStatus.RUNNING, CaseStatus.ERROR],
        },
      }).lean();
    } else {
      throw new Error('parameter validation failed');
    }

    const results: RunResult[] = [];

    const promises = caseInstances.map(async (ins) => {
      let total = 0;
      const {
        steps,
        mocks,
        webInfo: { url, width, height },
      } = ins;
      try {
        const imageDatas = await runTask(steps, mocks, url, width, height);
        total = imageDatas.length;
        let task = await Task.findOne({ case: ins._id });
        if (!task) {
          task = new Task({
            case: ins._id,
            results: {
              baseline: {
                name: commit,
                screenshots: imageDatas.map((data) => ({ test: data })),
                total,
                createAt: new Date(),
                updateAt: new Date(),
              },
            },
          });
          await task.save();
          return {
            caseId: ins._id,
            isError: false,
            total,
          };
        }
        const references = task.results.baseline.screenshots.map(
          ({ test }: any) => test,
        );
        if (references.length !== imageDatas.length) {
          return {
            caseId: ins._id,
            isError: true,
            errorMsg:
              'the quantity of screenshots is different from that of baseline',
            total,
          };
        }
        const diffs = await diffImages(references, imageDatas, width, height);
        const failed = diffs.reduce(
          (previousValue: number, currentValue: string) =>
            previousValue + (currentValue.length > 0 ? 1 : 0),
          0,
        );

        task.set(`results.${commit}`, {
          name: commit,
          screenshots: imageDatas.map((data, index) => ({
            test: data,
            diff: diffs[index],
            passed: !diffs[index],
          })),
          total,
          failed,
          success: total - failed,
          createAt: task.results[commit as string]?.createAt || new Date(),
          updateAt: new Date(),
        });
        await task.save();

        return {
          caseId: ins._id,
          isError: false,
          total,
          failed,
          success: total - failed,
        };
      } catch (err: any) {
        return {
          caseId: ins._id,
          isError: true,
          errorMsg: err.message,
          total,
        };
      }
    });

    // 按次序输出
    for (const promise of promises) {
      results.push(await promise);
    }
    normalizeSuccess(res, { results });
  } catch (err: any) {
    normalizeError(res, err.message);
  }
});

// next-connect默认会过滤一些请求，所以没用handler.use
export default async function handleWrap(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await runMiddleware(req, res, cors);
  await handler(req, res);
}

export const config = {
  api: {
    bodyParser: true,
  },
};
