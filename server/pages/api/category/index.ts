import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import Category from '@/models/category';
import HttpStatus from 'http-status-codes';
import moment from 'moment';

import nextConnect from 'next-connect';
import { handlePagination } from 'utils';
import { SORTER_ASC, SORTER_DES } from '@/constant/index';
import Project from '@/models/project';
import { getAllSubCategoryId, handleTree } from './util';
import Case from '@/models/case';

const handler = nextConnect();

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      query: { projectId },
    } = req;

    await conn();
    const project = await Project.findOne({ seq: projectId });
    if (!project) {
      throw new Error('projectId do not exist');
    }
    const categories = await Category.find({ project: project._id });
    const categoryTree = handleTree(categories);

    res.status(HttpStatus.OK).json({ data: categoryTree, message: '' });
  } catch (err: any) {
    console.log(err);
    res.status(HttpStatus.BAD_REQUEST).json({ error: err.message });
  }
});

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      body: { title, parentId },
    } = req;

    await conn();
    const category = await Category.findOne({ _id: parentId });

    if (!category) {
      throw new Error('parent do not exist');
    }

    const categoryInstances = await Category.create({
      title,
      parent: parentId,
      project: category.project,
    });

    res
      .status(HttpStatus.OK)
      .json({ data: categoryInstances, code: 0, message: '' });
  } catch (err: any) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: err.message });
  }
});

handler.put(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      body: { title, id },
    } = req;

    await conn();
    await Category.updateOne(
      { _id: id },
      {
        title,
      },
    );

    res.status(HttpStatus.OK).json({ data: { id }, code: 0, message: '' });
  } catch (err: any) {
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
    const category = await Category.findOne({
      _id: id,
    });
    if (!category) {
      throw new Error('category do not exist');
    }
    // if (!category.parent) {
    //   throw new Error('root node can not delete');
    // }
    const ids: string[] = await getAllSubCategoryId(category.project, id);
    const len = await Case.find({
      category: {
        $in: ids,
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

    res.status(HttpStatus.OK).json({ data: {}, code: 0, message: '' });
  } catch (err: any) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: err.message });
  }
});

export default handler;

export const config = {
  api: {
    bodyParser: true,
  },
};
