import type { NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Project from '@/models/project';
import { PROJECT_STATUS, ROLE_TYPE } from '@/constant';
import { newProjectSeq } from '@/utils/dbHelper';
import { HydratedDocument, Schema } from 'mongoose';
import nextConnect from 'next-connect';
import Category from '@/models/category';
import Role, { RoleDb } from '@/models/role';
import Case, { CaseStatus } from '@/models/case';
import auth from '@/middleware/auth';
import multipartFormParser from '@/middleware/multipart-form-parser';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';
import type { NextApiRequestWithContext } from '@/types';

const handler = nextConnect();

handler.use(multipartFormParser);

handler.use(auth);

handler.put(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
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
      const ownerArr = owners ? owners.split(',') : [];
      const memberArr = members ? members.split(',') : [];

      const [category, roles] = await Promise.all([
        Category.create({
          project: doc._id,
          title: 'all',
        }),
        RoleDb.createRoles([
          {
            type: ROLE_TYPE.owner,
            name: `${name}-owner`,
            project: doc._id as unknown as Schema.Types.ObjectId,
            users: ownerArr,
          },
          {
            type: ROLE_TYPE.member,
            name: `${name}-member`,
            project: doc._id as unknown as Schema.Types.ObjectId,
            users: memberArr,
          },
        ]),
      ]);

      doc.category = category._id;
      doc.ownerRole = roles[0]._id;
      doc.memberRole = roles[1]._id;
      await doc.save();
    } else {
      const ownerArr = owners ? owners.split(',') : [];
      const memberArr = members ? members.split(',') : [];
      if (!req.user?.isAdmin && !ownerArr.includes(req.user?._id.toString())) {
        throw Error('No permission');
      }

      doc = await Project.findOneAndUpdate(
        { seq: Number(id) },
        { name, logo, desc },
      );
      await Role.findOneAndUpdate(
        { _id: doc.ownerRole },
        { $set: { users: ownerArr } },
      );
      await Role.findOneAndUpdate(
        { _id: doc.memberRole },
        { $set: { users: memberArr } },
      );
    }

    normalizeSuccess(res, { id: doc.seq });
  } catch (err: any) {
    console.log(err);
    normalizeError(res, err.message);
  }
});

handler.delete(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
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
