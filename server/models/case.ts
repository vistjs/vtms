import { Schema, models, model } from 'mongoose';

export enum CaseStatus {
  NOTACTIVE,
  ACTIVE,
  RUNNING,
  ERROR,
  DELETE,
}

interface Case {
  name: string;
  records: Schema.Types.Mixed;
  apis: Schema.Types.Mixed;
  url: string;
  status: CaseStatus;
  runs: number;
  lastRun: Date;
  lastOperator: number;
  width: number;
  height: number;
  category: Schema.Types.ObjectId;
  project: Schema.Types.ObjectId;
  createAt?: Date;
  updateAt?: Date;
}

const CaseSchema = new Schema<Case>({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: Number,
    default: CaseStatus.NOTACTIVE,
    index: true,
  },
  records: {
    type: Schema.Types.Mixed,
    required: true,
  },
  apis: {
    type: Schema.Types.Mixed,
    required: true,
  },
  runs: {
    type: Number,
    required: true,
    default: 0,
  },
  lastRun: {
    type: Date,
    required: false,
  },
  lastOperator: {
    type: Number,
  },
  url: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  createAt: {
    type: Date,
    required: false,
  },
  updateAt: {
    type: Date,
    required: false,
  },
});

CaseSchema.pre('save', function (next) {
  if (!this.createAt) {
    this.createAt = new Date();
    this.updateAt = new Date();
  }
  // 只有修改status和name才更新updateAt
  next();
});

const Case = models.Case || model<Case>('Case', CaseSchema);

export default Case;
