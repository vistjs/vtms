import type { NextApiResponse } from 'next';
import conn from '@/utils/mongoose';
import Case, { CaseStatus } from '@/models/case';
import nextConnect from 'next-connect';
import auth from '@/middleware/auth';
import type { NextApiRequestWithContext } from '@/types/index';
import { normalizeSuccess, normalizeError } from '@/utils/resHelper';
import { projectRoleHandle } from '@/utils/dbHelper';

const handler = nextConnect();

handler.use(auth);

handler.put(async (req: NextApiRequestWithContext, res: NextApiResponse) => {
  try {
    const {
      query: { id },
      body: { name, status, categoryId },
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
      query: { id },
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
