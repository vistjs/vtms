import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import Case, { CaseStatus } from '@/models/case';
import HttpStatus from 'http-status-codes';
import moment from 'moment';
import nextConnect from 'next-connect';
import Project from '@/models/project';
import { normalizeSuccess, normalizeError, handlePagination } from '@/utils';

const handler = nextConnect();
const getRamdomStr = () => Math.random().toString(36).slice(2);

handler.use(async (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
  next();
});

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const defaultName = `new case on ${moment().format(
      'YYYY-MM-DD_HH:mm:ss',
    )} ${getRamdomStr()}`;
    const {
      body: { name = defaultName, frames, apis, url, w, h, pid },
    } = req;

    if (!frames || !pid || !w || !h) {
      throw new Error('parameter validation failed');
    }

    await conn();
    const project = await Project.findOne({
      seq: pid,
    });
    if (!project) {
      throw new Error('project does not exist');
    }
    const caseInstance = await Case.create({
      name,
      frames,
      apis,
      url,
      width: w,
      height: h,
      project: project._id,
      category: project.category,
    });

    normalizeSuccess(res, { id: caseInstance._id });
  } catch (err: any) {
    console.log(err);
    normalizeError(res, err?.message);
  }
});

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      query: { id, current, pageSize },
    } = req;

    await conn();
    let caseInstances;
    if (id) {
      caseInstances = await Case.findOne({
        _id: id,
      });
    } else {
      const { offset, limit } = handlePagination(current, pageSize);
      const caseInstances = await Case.find({
        status: {
          $in: [CaseStatus.ACTIVE, CaseStatus.RUNNING, CaseStatus.ERROR],
        },
      })
        .skip(offset)
        .limit(limit);
    }

    normalizeSuccess(res, { cases: caseInstances });
  } catch (err: any) {
    console.log(err);
    normalizeError(res, err.message);
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
      if (caseInstance === CaseStatus.RUNNING) {
        caseInstance.status = CaseStatus.ACTIVE;
        await caseInstance.save();
      } else {
        throw new Error('only running status can convert to success');
      }
    }

    if (targetStatus === CaseStatus.ERROR) {
      // 代表用例失败
      if (caseInstance === CaseStatus.RUNNING) {
        caseInstance.status = CaseStatus.ERROR;
        await caseInstance.save();
      } else {
        throw new Error('only running status can convert to error');
      }
    }

    if (targetStatus === CaseStatus.RUNNING) {
      // 代表用例执行中
      if (
        caseInstance === CaseStatus.ACTIVE ||
        caseInstance === CaseStatus.ERROR
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

export default handler;

export const config = {
  api: {
    bodyParser: true,
  },
};
