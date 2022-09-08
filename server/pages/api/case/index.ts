import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import Case, { CaseStatus } from '@/models/case';
import HttpStatus from 'http-status-codes';
import nextConnect from 'next-connect';
import { handlePagination } from 'utils';
import { SORTER_ASC, SORTER_DES } from '@/constant/index';
import Category from '@/models/category';
import { getAllSubCategoryId } from '../category/util';
import Project from '@/models/project';
import auth from '@/middleware/auth';
import type { NextApiRequestWithContext } from '@/types/index';
import { normalizeSuccess, normalizeError } from '@/utils';
import projectRoleHandle from '@/utils/projectRoleHandle';

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
        updateAt,
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
        console.log('ids', ids);
        casesQuery.where({
          category: {
            $in: ids,
          },
        });
      }
    }
    if (updateAt && typeof updateAt === 'string' && updateAt == SORTER_ASC) {
      casesQuery.sort({
        updateAt: 'asc',
      });
    } else {
      casesQuery.sort({
        updateAt: 'desc',
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

handler.put(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  try {
    const {
      body: { name, status, id, categoryId },
    } = req;

    await conn();
    if (!id) {
      throw new Error('id is required');
    }

    const caseInstance = await Case.findOne({
      _id: id,
    });
    if (!caseInstance) {
      throw new Error('case does not exist');
    }
    projectRoleHandle(req.user, caseInstance.project.toString());

    await caseInstance.update({
      name,
      status,
      category: categoryId,
      lastOperator: req.user?._id,
      updateAt: new Date(),
    });

    normalizeSuccess(res, { id });
  } catch (err: any) {
    console.log(err);
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

    const caseInstance = await Case.findOne({
      _id: id,
    });
    if (!caseInstance) {
      throw new Error('case does not exist');
    }
    projectRoleHandle(req.user, caseInstance.project.toString());

    await caseInstance.update({
      status: CaseStatus.DELETE,
    });
    normalizeSuccess(res, { id });
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
