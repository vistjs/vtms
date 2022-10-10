import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import Case, { CaseStatus } from '@/models/case';
import nextConnect from 'next-connect';
import Project from '@/models/project';
import { normalizeSuccess, normalizeError, handlePagination } from '@/utils';
import { runTask } from '@/lib/runPuppeteer';
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

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      query: { projectId, commitId },
    } = req;

    await conn();
    if (!projectId) {
      throw new Error('projectId is required');
    }
    const project = await Project.findOne({
      seq: projectId,
    });
    if (!project) {
      throw new Error('project do not exist');
    }
    const caseInstances = await Case.find({
      project: project._id,
      status: {
        $in: [CaseStatus.ACTIVE, CaseStatus.RUNNING, CaseStatus.ERROR],
      },
    }).lean();

    let imgs: string[] = [];
    await Promise.all(
      caseInstances.map(async (ins) => {
        const igs = await runTask(
          ins.frames,
          ins.apis,
          ins.url,
          ins.width,
          ins.height,
        );
        imgs = imgs.concat(igs);
      }),
    );
    normalizeSuccess(res, { images: imgs.slice(-1) });
  } catch (err: any) {
    console.log(err);
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
