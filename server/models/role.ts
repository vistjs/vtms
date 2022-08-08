import { Schema, models, model  } from 'mongoose';

import { ROLE_TYPE } from '@/constant/index'

export interface IRole {
  id: string;
  name: string;
  type: ROLE_TYPE;
  project_id: string;
}

const roleSchema = new Schema<IRole>({
  id: {type: String, required: true, unique: true},
  name: {type: String, required: true, unique: true},
  type: {type: Number,required: true},
  project_id: {type: String, required: true},
}, { timestamps: true });

roleSchema.index({ name: 1 });

const RoleModel = models.Role || model<IRole>('Role', roleSchema);

export default RoleModel;