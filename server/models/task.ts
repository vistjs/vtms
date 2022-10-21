import { Schema, models, model } from 'mongoose';

interface Result {
  branch: string;
  screenshots: {
    test: string;
    diff?: string;
    passed?: boolean;
  }[];
  total: number;
  passed: number;
  failed: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  case: Schema.Types.ObjectId;
  width: number;
  height: number;
  results: {
    [branch: string]: Result;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskSchema = new Schema<Task>(
  {
    case: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
    },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    results: Schema.Types.Mixed,
  },
  { timestamps: true },
);

const Task = models.Task || model<Task>('Task', TaskSchema);

export default Task;
