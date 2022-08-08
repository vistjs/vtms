import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import Case, { CaseStatus } from '@/models/case';
import HttpStatus from 'http-status-codes';
import moment from 'moment';

import nextConnect from 'next-connect';
import { handlePagination } from 'utils';
import { SORTER_ASC, SORTER_DES } from '@/constant/index';
import Category from '@/models/category';
import { getAllSubCategoryId } from '../category/util';
import Project from '@/models/project';

const handler = nextConnect();
const getRamdomStr = () => Math.random().toString(36).slice(2);

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
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

    const { page, limit } = handlePagination(current, pageSize);

    await conn();
    const project = await Project.findOne({
      seq: Number(projectId),
    });

    if (!project) {
      throw new Error('project do not exist');
    }

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
        throw new Error('categoryId do not exist in this project');
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
    if (updateAt && typeof updateAt === 'string') {
      if (updateAt == SORTER_ASC) {
        casesQuery.sort({
          updateAt: 'asc',
        });
      } else if (updateAt == SORTER_DES) {
        casesQuery.sort({
          updateAt: 'desc',
        });
      }
    }

    const totalQuery = casesQuery.clone().count();

    casesQuery.skip((page - 1) * limit).limit(limit);

    const [cases, total] = await Promise.all([
      casesQuery.exec(),
      totalQuery.exec(),
    ]);

    res.status(HttpStatus.OK).json({ data: cases, total, message: '' });
  } catch (err: any) {
    console.log(err);
    res.status(HttpStatus.BAD_REQUEST).json({ error: err.message });
  }
});

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log(req.body);
    const defaultName = `new case on ${moment().format(
      'YYYY-MM-DD_HH:mm:ss',
    )} ${getRamdomStr()}`;
    const {
      body: {
        name = defaultName,
        records,
        apis,
        url,
        width,
        height,
        projectId,
      },
    } = req;

    await conn();
    const project = await Project.findOne({
      seq: projectId,
    });
    const caseInstances = await Case.create({
      name,
      records,
      apis,
      url,
      width,
      height,
      project: project._id,
      category: project.category,
    });
    res
      .status(HttpStatus.OK)
      .json({ data: { id: caseInstances._id }, code: 0, message: '' });
  } catch (err: any) {
    console.log(err);
    res.status(HttpStatus.BAD_REQUEST).json({ error: err.message });
  }
});

handler.put(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      body: { name, status, id, categoryId },
    } = req;

    await conn();
    if (!id) {
      throw new Error('id is required');
    }
    await Case.updateOne(
      {
        _id: id,
      },
      {
        name,
        status,
        category: categoryId,
        lastOperator: 0,
      },
    );
    res.status(HttpStatus.OK).json({ data: { id }, code: 0, message: '' });
  } catch (err: any) {
    console.log(err);
    res.status(HttpStatus.BAD_REQUEST).json({ error: err.message });
  }
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      body: { id },
    } = req;
    if (!id) {
      throw new Error('id is required');
    }
    await conn();
    await Case.updateOne(
      {
        _id: id,
      },
      {
        status: CaseStatus.DELETE,
      },
    );
    res.status(HttpStatus.OK).json({ data: { id }, code: 0, message: '' });
  } catch (err: any) {
    console.log(err);
    res.status(HttpStatus.BAD_REQUEST).json({ error: err.message });
  }
});

export default handler;

export const config = {
  api: {
    bodyParser: true,
  },
};
