export interface AddUser extends Omit<API.User, 'roles'> {
  roles: API.Role[];
}
