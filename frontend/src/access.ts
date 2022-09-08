/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: Auth.User } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: (currentUser && currentUser?.isAdmin) || false,
    canEditProject: (owners: string[]) => {
      return (
        (currentUser &&
          currentUser?._id &&
          (currentUser.isAdmin || owners.includes(currentUser?._id))) ||
        false
      );
    },
    canViewProject: (owners: string[], members: string[]) => {
      return (
        (currentUser &&
          currentUser?._id &&
          (currentUser.isAdmin ||
            owners.includes(currentUser?._id) ||
            members.includes(currentUser?._id))) ||
        false
      );
    },
  };
}
