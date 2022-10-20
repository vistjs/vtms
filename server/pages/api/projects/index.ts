import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Project from '@/models/project';
import nextConnect from 'next-connect';
import { PROJECT_STATUS } from '@/constant';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';

const handler = nextConnect();

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await conn();
    const docs = await Project.find({ status: PROJECT_STATUS.enable })
      .populate('ownerRole')
      .populate('memberRole')
      .lean();
    normalizeSuccess(res, { list: docs });
  } catch (err: any) {
    normalizeError(res, err.message);
  }
});

export default handler;
