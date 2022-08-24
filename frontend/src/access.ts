/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: Auth.User } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser.isAdmin,
    canEditProject: (owners: string[]) => {
      return currentUser && owners.includes(currentUser?._id);
    },
    canViewProject: (owners: string[], members: string[]) => {
      return (
        (currentUser && owners.includes(currentUser?._id)) ||
        (currentUser?._id && members.includes(currentUser?._id))
      );
    },
  };
}
