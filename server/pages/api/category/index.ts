import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import Category from '@/models/category';

import nextConnect from 'next-connect';
import Project from '@/models/project';
import { getAllSubCategoryId, handleTree } from './util';
import Case, { CaseStatus } from '@/models/case';
import auth from '@/middleware/auth';
import { normalizeSuccess, normalizeError } from '@/utils';
import projectRoleHandle from '@/utils/projectRoleHandle';
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

handler.post(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  try {
    const {
      body: { title, parentId },
    } = req;

    await conn();
    const category = await Category.findOne({ _id: parentId });

    if (!category) {
      throw new Error('parent does not exist');
    }
    projectRoleHandle(req.user, category.project.toString());

    const categoryInstances = await Category.create({
      title,
      parent: parentId,
      project: category.project,
    });

    normalizeSuccess(res, categoryInstances);
  } catch (err: any) {
    normalizeError(res, err.message, err.code);
  }
});

handler.put(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  try {
    const {
      body: { title, id },
    } = req;

    const category = await Category.findOne({ _id: id });

    if (!category) {
      throw new Error('category does not exist');
    }

    projectRoleHandle(req.user, category.project.toString());

    await conn();
    await category.update({
      title,
    });

    normalizeSuccess(res, { id });
  } catch (err: any) {
    normalizeError(res, err.message, err.code);
  }
});

handler.delete(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  try {
    const {
      body: { id },
    } = req;

    if (!id) {
      throw new Error('id is required');
    }

    await conn();
    const category = await Category.findOne({
      _id: id,
    });
    if (!category) {
      throw new Error('category does not exist');
    }
    projectRoleHandle(req.user, category.project.toString());

    const ids: string[] = await getAllSubCategoryId(category.project, id);
    const len = await Case.find({
      category: {
        $in: ids,
      },
      status: {
        $in: [
          CaseStatus.ACTIVE,
          CaseStatus.NOTACTIVE,
          CaseStatus.RUNNING,
          CaseStatus.ERROR,
        ],
      },
    }).count();
    if (len > 0) {
      throw new Error(
        'Please move all cases out of it if you want to delete the folder.',
      );
    } else {
      await Category.deleteMany({
        _id: {
          $in: ids,
        },
      });
    }

    normalizeSuccess(res, null);
  } catch (err: any) {
    normalizeError(res, err.message, err.code);
  }
});

export default handler;

export const config = {
  api: {
    bodyParser: true,
  },
};
