import { Schema, models, model } from 'mongoose';

export enum CaseStatus {
  NOTACTIVE,
  ACTIVE,
  RUNNING,
  SUCCESS,
  ERROR,
  DELETE,
}

interface Case {
  name: string;
  category: Schema.Types.ObjectId;
  project: Schema.Types.ObjectId;
  webInfo: {
    url: string;
    width: number;
    height: number;
  };
  steps: Schema.Types.Mixed;
  mocks: Schema.Types.Mixed;
  status: CaseStatus;
  runs: number;
  lastRun: Date;
  createdAt?: Date;
  updatedAt?: Date;
  lastOperator: Schema.Types.ObjectId;
  noticeHook?: string;
}

const CaseSchema = new Schema<Case>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    webInfo: {
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
    },
    steps: {
      type: Schema.Types.Mixed,
      required: true,
    },
    mocks: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: Number,
      default: CaseStatus.NOTACTIVE,
    },
    runs: {
      type: Number,
      default: 0,
    },
    lastRun: {
      type: Date,
      required: false,
    },
    lastOperator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    noticeHook: {
      type: String,
    },
  },
  { timestamps: true },
);

CaseSchema.index({ name: 1 });

const Case = models.Case || model<Case>('Case', CaseSchema);

export default Case;
