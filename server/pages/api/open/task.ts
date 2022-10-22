import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Case, { CaseStatus } from '@/models/case';
import nextConnect from 'next-connect';
import Project from '@/models/project';
import Category from '@/models/category';
import Task from '@/models/task';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';
import { replacePlaceholder } from '@/utils/common';
import { runTask } from '@/utils/runPuppeteer';
import * as curlconverter from 'curlconverter';
const curl = require('@/utils/curl.js');
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
      query: { pid, cid, category: categoryId, commit, token },
    } = req;

    await conn();
    if (!token) {
      throw new Error('parameter error, need token');
    }
    if (!commit) {
      throw new Error('parameter error, need commit');
    } else if (commit === 'master') {
      throw new Error('parameter error, commit can not be master');
    }
    let caseInstances;
    if (pid) {
      const project = await Project.findOne({
        seq: pid,
      }).lean();
      if (!project) {
        throw new Error('project do not exist');
      } else if (token !== project.token) {
        throw new Error('parameter error, token error');
      }
      caseInstances = await Case.find({
        project: project._id,
        status: {
          $in: [CaseStatus.ACTIVE, CaseStatus.SUCCESS, CaseStatus.ERROR],
        },
      });
    } else if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
      }).lean();
      if (!category) {
        throw new Error('category do not exist');
      }
      caseInstances = await Case.find({
        category: categoryId,
        status: {
          $in: [CaseStatus.ACTIVE, CaseStatus.SUCCESS, CaseStatus.ERROR],
        },
      });
    } else {
      throw new Error('parameter validation failed');
    }

    const results: RunResult[] = [];

    const promises = caseInstances.map(async (ins) => {
      let total = 0;
      const {
        name: caseName,
        steps,
        mocks,
        webInfo: { url, width, height },
        noticeHook,
      } = ins;
      try {
        const imageDatas = await runTask(steps, mocks, url, width, height);
        total = imageDatas.length;
        let task = await Task.findOne({ case: ins._id });
        ins.status = CaseStatus.RUNNING;
        await ins.save();
        if (!task) {
          task = new Task({
            case: ins._id,
            width,
            height,
            results: {
              master: {
                branch: commit,
                screenshots: imageDatas.map((data) => ({ test: data })),
                total,
                passed: total,
                failed: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
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
        const references = task.results.master.screenshots.map(
          ({ test }: any) => test,
        );
        if (references.length !== imageDatas.length) {
          return {
            caseId: ins._id,
            isError: true,
            errorMsg:
              'the quantity of screenshots is different from that of master',
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
          branch: commit,
          screenshots: imageDatas.map((data, index) => ({
            test: data,
            diff: diffs[index] || undefined,
            passed: !diffs[index] || undefined,
          })),
          total,
          failed,
          passed: total - failed,
          createdAt: task.results[commit as string]?.createdAt || new Date(),
          updatedAt: new Date(),
        });
        await task.save();

        ins.runs += 1;
        ins.lastRun = new Date();
        ins.status = CaseStatus.SUCCESS;
        await ins.save();
        if (noticeHook) {
          try {
            curl(
              curlconverter.toBrowser(
                replacePlaceholder(noticeHook, {
                  case: caseName,
                  isError: false,
                  total,
                  failed,
                  passed: total - failed,
                }),
              ),
            );
          } catch (e: any) {}
        }
        return {
          caseId: ins._id,
          isError: false,
          total,
          failed,
          passed: total - failed,
        };
      } catch (err: any) {
        ins.status = CaseStatus.ERROR;
        await ins.save();
        if (noticeHook) {
          try {
            curl(
              curlconverter.toBrowser(
                replacePlaceholder(noticeHook, {
                  case: caseName,
                  isError: true,
                  errorMsg: err.message,
                  total,
                }),
              ),
            );
          } catch (e: any) {}
        }
        return {
          caseId: ins._id,
          isError: true,
          errorMsg: err.message,
          total,
        };
      }
    });

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
