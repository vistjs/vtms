import type { NextApiResponse } from 'next';
import { NextApiRequestWithContext } from '../types';
import { normalizeError } from '@/utils/resHelper';
import { ErrorCode } from '@/constant';

export default async function userIsAdminAuth(
  req: NextApiRequestWithContext,
  res: NextApiResponse,
  next: any,
) {
  console.log('user auth middleware:', req?.user);
  if (req?.user?.isAdmin) {
    next();
  } else {
    normalizeError(
      res,
      'Sorry, you are not admin role.',
      ErrorCode.NO_PERMISSION,
    );
  }
}
