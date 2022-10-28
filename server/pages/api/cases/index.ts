import type { NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Case, { CaseStatus } from '@/models/case';
import nextConnect from 'next-connect';
import { SORTER_ASC, SORTER_DES } from '@/constants';
import Category from '@/models/category';
import { getAllSubCategoryId } from '@/utils/category';
import Project from '@/models/project';
import auth from '@/middleware/auth';
import type { NextApiRequestWithContext } from '@/types';
import {
  handlePagination,
  normalizeSuccess,
  normalizeError,
} from '@/utils/resHelper';
import { projectRoleHandle } from '@/utils/common';

const handler = nextConnect();

handler.use(auth);

handler.get(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  try {
    const {
      query: {
        current,
        pageSize,
        name,
        status,
        updatedAt,
        projectId,
        categoryId,
      },
    } = req;

    if (!projectId) {
      throw new Error('projectId is required');
    }
    if (Array.isArray(projectId) || !Number(projectId)) {
      throw new Error('projectId is number');
    }

    const { offset, limit } = handlePagination(current, pageSize);

    await conn();
    const project = await Project.findOne({
      seq: Number(projectId),
    });
    if (!project) {
      throw new Error('project does not exist');
    }

    projectRoleHandle(req.user, project._id.toString());

    const casesQuery = Case.find({
      project: project._id,
    });
    if (name && typeof name === 'string') {
      casesQuery.where({
        name: new RegExp(name),
      });
    }
    if (status) {
      const queryStatus = Array.isArray(status) ? status : [status];
      casesQuery.where({
        status: {
          $in: queryStatus,
        },
      });
    } else {
      casesQuery.where({
        status: {
          $in: [
            CaseStatus.ACTIVE,
            CaseStatus.NOTACTIVE,
            CaseStatus.RUNNING,
            CaseStatus.SUCCESS,
            CaseStatus.ERROR,
          ],
        },
      });
    }
    if (categoryId && !Array.isArray(categoryId)) {
      const category = await Category.findOne({
        _id: categoryId,
        project: project._id,
      });
      if (!category) {
        throw new Error('categoryId does not exist in this project');
      }
      if (category.parent) {
        // 没有父节点代表是跟节点， 不需要过滤
        const ids = await getAllSubCategoryId(project._id, categoryId);
        casesQuery.where({
          category: {
            $in: ids,
          },
        });
      }
    }
    if (updatedAt && typeof updatedAt === 'string' && updatedAt == SORTER_ASC) {
      casesQuery.sort({
        updatedAt: 'asc',
      });
    } else {
      casesQuery.sort({
        updatedAt: 'desc',
      });
    }

    const totalQuery = casesQuery.clone().count();

    casesQuery.populate('lastOperator', 'username').skip(offset).limit(limit);

    const [cases, total] = await Promise.all([
      casesQuery.exec(),
      totalQuery.exec(),
    ]);

    normalizeSuccess(res, { list: cases, total });
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
