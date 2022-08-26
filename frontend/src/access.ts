/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: Auth.User } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser?.isAdmin || false,
    canEditProject: (owners: string[]) => {
      return currentUser?._id && (currentUser.isAdmin || owners.includes(currentUser?._id));
    },
    canViewProject: (owners: string[], members: string[]) => {
      return (
        currentUser?._id &&
        (currentUser.isAdmin ||
          owners.includes(currentUser?._id) ||
          members.includes(currentUser?._id))
      );
    },
  };
}
