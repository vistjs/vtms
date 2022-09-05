import { ErrorCode } from '@/constant';
import { NextApiRequestWithContext } from '@/types';

export default function projectRoleHandle(
  user: NextApiRequestWithContext['user'],
  projectId: string,
) {
  if (user && user.isAdmin === false) {
    let hasPermission = false;
    const { roles } = user;
    if (roles) {
      const role = roles.find((v) => v.project?.toString() === projectId);
      if (role) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      const noPermissionError: Error & {
        code?: ErrorCode;
      } = new Error('NO PERMISSION');
      noPermissionError.code = ErrorCode.NO_PERMISSION;
      throw noPermissionError;
    }
  }
}
