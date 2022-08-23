import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import Case from '@/models/case';
import HttpStatus from 'http-status-codes';
import moment from 'moment';
import nextConnect from 'next-connect';
import Project from '@/models/project';
import { normalizeSuccess, normalizeError } from '@/utils';

const handler = nextConnect();
const getRamdomStr = () => Math.random().toString(36).slice(2);

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
    const caseInstances = await Case.create({
      name,
      frames,
      apis,
      url,
      width: w,
      height: h,
      project: project._id,
      category: project.category,
    });

    normalizeSuccess(res, { id: caseInstances._id });
  } catch (err: any) {
    console.log(err);
    normalizeError(res, err?.message);
  }
});

export default handler;

export const config = {
  api: {
    bodyParser: true,
  },
};
