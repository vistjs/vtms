import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Category from '@/models/category';
import nextConnect from 'next-connect';
import Project from '@/models/project';
import { handleTree } from '@/utils/category';
import auth from '@/middleware/auth';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';
import { projectRoleHandle } from '@/utils/common';
import { NextApiRequestWithContext } from '@/types';

const handler = nextConnect();

handler.use(auth);

handler.get(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  try {
    const {
      query: { projectId },
    } = req;

    await conn();
    const project = await Project.findOne({ seq: projectId });
    if (!project) {
      throw new Error('projectId does not exist');
    }
    projectRoleHandle(req.user, project._id.toString());

    const categories = await Category.find({ project: project._id });
    const categoryTree = handleTree(categories);

    normalizeSuccess(res, categoryTree);
  } catch (err: any) {
    console.log(err);
    normalizeError(res, err.message, err.code);
  }
});

export default handler;

export const config = {
  api: {
    bodyParser: true,
  },
};
