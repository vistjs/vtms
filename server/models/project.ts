import { Schema, models, model  } from 'mongoose';
import { PROJECT_STATUS } from '../constant'

interface IProject {
  name: string;
  seq: number;
  desc?: string;
  logo?: string;
  status?: number;
  createAt?: number;
  updateAt?: number;
}

const projectSchema = new Schema<IProject>({
  name: {type: String, required: true, unique: true},
  seq: {type: Number, required: true},
  desc: {type: String, maxLength: 200},
  logo: String,
  status:  {type: Number, default: PROJECT_STATUS.enable},
}, { timestamps: true });

projectSchema.index({ name: 1 });

const Project = models.Project || model<IProject>('Project', projectSchema);

export default Project