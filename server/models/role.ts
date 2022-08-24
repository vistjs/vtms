import { Schema, models, model, Types } from 'mongoose';

import conn from '@/lib/mongoose';
import { ROLE_TYPE } from '@/constant/index';
import { newRoleSeq } from '@/utils/index';

export interface IRole {
  id: string;
  name: string;
  type: ROLE_TYPE;
  project?: Schema.Types.ObjectId;
  users?: Types.ObjectId[];
  desc?: string;
}

const roleSchema = new Schema<IRole>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    type: { type: Number, required: true },
    project: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Project',
    },
    desc: { type: String, required: false },
  },
  { timestamps: true },
);

roleSchema.index({ name: 1 });

const RoleModel = models.Role || model<IRole>('Role', roleSchema);

export const RoleDb = {
  async createRoles(roles: IRole[]) {
    await conn();
    const roleCount = roles?.length;
    const currentSeqId = await newRoleSeq();
    await newRoleSeq(roleCount);
    const withIdRoles = roles.map((role, index) => ({
      ...role,
      id: currentSeqId + index + 1,
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
