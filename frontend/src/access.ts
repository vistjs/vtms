/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    canEditProject: (owners: string[]) => {
      return owners.includes(currentUser._id);
    },
    canViewProject: (owners: string[], members: string[]) => {
      return owners.includes(currentUser._id) || members.includes(currentUser._id);
    },
  };
}
