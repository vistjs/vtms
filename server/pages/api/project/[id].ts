import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import Project from '@/models/project';
import { PROJECT_STATUS } from '@/constant/index';
import HttpStatus from 'http-status-codes';
import middleware from '../../../middleware/middleware';
import { newProjectSeq } from '../../../utils';
import { ROLE_TYPE } from '@/constant/index';

import nextConnect from 'next-connect';
import Category from '@/models/category';
import { RoleDb } from '@/models/role';
import Case, { CaseStatus } from '@/models/case';

const handler = nextConnect();

handler.use(middleware);

handler.put(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      query: { id },
      body: { name, desc, logo },
    } = req;
    await conn();
    let doc;
    if (id === 'create') {
      const seqId = await newProjectSeq();
      doc = await Project.create({
        name,
        logo,
        desc,
        seq: seqId,
      });
      const [category, _] = await Promise.all([
        Category.create({
          project: doc._id,
          title: 'all',
        }),
        RoleDb.createRoles([
          {
            id: '',
            type: ROLE_TYPE.owner,
            name: `${name}-owner`,
            project: doc._id,
          },
          {
            id: '',
            type: ROLE_TYPE.member,
            name: `${name}-member`,
            project: doc._id,
          },
        ]),
      ]);

      doc.category = category._id;
      await doc.save();
    } else {
      doc = await Project.findOneAndUpdate(
        { seq: Number(id) },
        { name, logo, desc },
        { new: true, upsert: true },
      );
    }
    res
      .status(HttpStatus.OK)
      .json({ data: { id: doc.seq }, code: 0, message: '' });
  } catch (err: any) {
    console.log(err);
    res.status(HttpStatus.BAD_REQUEST).json({ error: err.message });
  }
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      query: { id },
    } = req;
    await conn();
    const doc = await Project.findOne({
      seq: Number(id),
    });
    const caseCount = await Case.find({
      project: doc._id,
      status: {
        $in: [
          CaseStatus.ACTIVE,
          CaseStatus.NOTACTIVE,
          CaseStatus.RUNNING,
          CaseStatus.ERROR,
        ],
      },
    }).count();
    if (caseCount > 0) {
      throw new Error(
        'Please delete all cases out of it if you want to delete the project.',
      );
    }
    doc.status = PROJECT_STATUS.deleted;
    await RoleDb.deleteRole(doc._id);
    doc.save();
    res
      .status(HttpStatus.OK)
      .json({ data: { id: doc.seq }, code: 0, message: '' });
  } catch (err: any) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: err.message });
  }
});

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
