import { Schema, models, model, Types } from 'mongoose';

import conn from '@/utils/mongoose';
import { ROLE_TYPE } from '@/constants';

export interface IRole {
  name: string;
  type: ROLE_TYPE;
  project?: Types.ObjectId;
  users?: Types.ObjectId[];
  desc?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    type: { type: Number, required: true },
    project: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Project',
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    desc: { type: String, required: false },
  },
  { timestamps: true },
);

roleSchema.index({ name: 1 });

const RoleModel = models.Role || model<IRole>('Role', roleSchema);

export const RoleDb = {
  async createRoles(roles: IRole[]) {
    await conn();
    const withIdRoles = roles.map((role, index) => ({
      ...role,
    }));
    const roleDoc = await RoleModel.create(withIdRoles);
    return roleDoc;
  },
  async deleteRole(project: Schema.Types.ObjectId) {
    await RoleModel.deleteMany({ project });
    return project;
  },
};
export default RoleModel;
