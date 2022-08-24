import type { NextApiRequest, NextApiResponse } from 'next';
import conn from '@/lib/mongoose';
import Project, { IProject } from '@/models/project';
import { PROJECT_STATUS, ROLE_TYPE, ErrorCode } from '@/constant/index';
import { newProjectSeq, normalizeResult } from '@/utils';
import mongoose, { HydratedDocument, Schema } from 'mongoose';
import nextConnect from 'next-connect';
import Category from '@/models/category';
import Role, { RoleDb } from '@/models/role';
import Case, { CaseStatus } from '@/models/case';
import auth from '@/middleware/auth';
import multipartFormParser from '@/middleware/multipart-form-parser';
import { normalizeSuccess, normalizeError } from '@/utils';

const handler = nextConnect();

handler.use(multipartFormParser);

handler.use(auth);

handler.put(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      query: { id },
      body: { name, desc, logo, owners, members },
    } = req;
    await conn();
    // let doc: HydratedDocument<IProject>;
    let doc;
    if (id === 'create') {
      const seqId = await newProjectSeq();
      doc = await Project.create({
        name,
        logo,
        desc,
        seq: seqId,
      });
      const [category, roles] = await Promise.all([
        Category.create({
          project: doc._id,
          title: 'all',
        }),
        RoleDb.createRoles([
          {
            id: '',
            type: ROLE_TYPE.owner,
            name: `${name}-owner`,
            project: doc._id as unknown as Schema.Types.ObjectId,
          },
          {
            id: '',
            type: ROLE_TYPE.member,
            name: `${name}-member`,
            project: doc._id as unknown as Schema.Types.ObjectId,
          },
        ]),
      ]);

      doc.category = category._id;
      doc.ownerRole = roles[0]._id;
      doc.memberRole = roles[1]._id;
      await doc.save();
    } else {
      const ownerUsers = (owners ? owners.split(',') : []).map(
        (id: string) => new mongoose.Types.ObjectId(id),
      );
      const memberUsers = (members ? members.split(',') : []).map(
        (id: string) => new mongoose.Types.ObjectId(id),
      );
      doc = await Project.findOneAndUpdate(
        { seq: Number(id) },
        { name, logo, desc },
        { new: true, upsert: true },
      );
      await Role.findOneAndUpdate(
        { _id: doc.ownerRole },
        { $set: { users: ownerUsers } },
      );
      await Role.findOneAndUpdate(
        { _id: doc.memberRole },
        { $set: { users: memberUsers } },
      );
    }

    normalizeSuccess(res, { id: doc.seq });
  } catch (err: any) {
    console.log(err);
    normalizeError(res, err.message);
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
    normalizeSuccess(res, { id: doc.seq });
  } catch (err: any) {
    normalizeError(res, err.message);
  }
});

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
