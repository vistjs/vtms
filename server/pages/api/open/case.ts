import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Case, { CaseStatus } from '@/models/case';
import moment from 'moment';
import nextConnect from 'next-connect';
import Project from '@/models/project';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';
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
const getRamdomStr = () => Math.random().toString(36).slice(2);

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const defaultName = `new case on ${moment().format(
      'YYYY-MM-DD_HH:mm:ss',
    )} ${getRamdomStr()}`;
    const {
      body: {
        name = defaultName,
        steps,
        mocks,
        url,
        width,
        height,
        pid,
        token,
      },
    } = req;

    if (!token) {
      throw new Error('parameter error, need token');
    }
    if (!steps || !pid || !width || !height) {
      throw new Error('parameter validation failed');
    }

    await conn();
    const project = await Project.findOne({
      seq: pid,
    });
    if (!project) {
      throw new Error('project does not exist');
    } else if (token !== project.token) {
      throw new Error('parameter error, token error');
    }
    const caseInstance = await Case.create({
      name,
      steps,
      mocks,
      webInfo: {
        url,
        width,
        height,
      },
      project: project._id,
      category: project.category,
    });

    normalizeSuccess(res, { id: caseInstance._id });
  } catch (err: any) {
    console.log(err);
    normalizeError(res, err?.message);
  }
});

handler.put(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      query: { id, status },
    } = req;

    await conn();

    const targetStatus = Number(status);
    const caseInstance = await Case.findOne({
      _id: id,
    });

    if (targetStatus === CaseStatus.ACTIVE) {
      // 代表用例成功
      if (caseInstance.status === CaseStatus.RUNNING) {
        caseInstance.status = CaseStatus.ACTIVE;
        await caseInstance.save();
      } else {
        throw new Error('only running status can convert to success');
      }
    }

    if (targetStatus === CaseStatus.ERROR) {
      // 代表用例失败
      if (caseInstance.status === CaseStatus.RUNNING) {
        caseInstance.status = CaseStatus.ERROR;
        await caseInstance.save();
      } else {
        throw new Error('only running status can convert to error');
      }
    }

    if (targetStatus === CaseStatus.RUNNING) {
      // 代表用例执行中
      if (
        caseInstance.status === CaseStatus.ACTIVE ||
        caseInstance.status === CaseStatus.ERROR
      ) {
        caseInstance.status = CaseStatus.ERROR;
        await caseInstance.save();
      } else {
        throw new Error('only active or error status can convert to running');
      }
    }

    normalizeSuccess(res, { case: caseInstance });
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
