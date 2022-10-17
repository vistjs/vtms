import { Schema, models, model } from 'mongoose';
import { PROJECT_STATUS } from '../constant';

export interface IProject {
  name: string;
  seq: number;
  desc?: string;
  logo?: string;
  status?: number;
  category: Schema.Types.ObjectId;
  ownerRole: Schema.Types.ObjectId;
  memberRole: Schema.Types.ObjectId;
  createAt?: Date;
  updateAt?: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, unique: true },
    seq: { type: Number, required: true },
    desc: { type: String, maxLength: 200 },
    logo: String,
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    ownerRole: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
    },
    memberRole: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
    },
    status: { type: Number, default: PROJECT_STATUS.enable },
  },
  { timestamps: true },
);

projectSchema.index({ name: 1 });

const Project = models.Project || model<IProject>('Project', projectSchema);
export default Project;
