import { Schema, models, model } from 'mongoose';

interface Result {
  name: string;
  screenshots: {
    test: string;
    diff?: string;
    passed?: boolean;
  }[];
  total: number;
  passed?: number;
  failed?: number;
  createAt: Date;
  updateAt: Date;
}

interface Task {
  case: Schema.Types.ObjectId;
  results: {
    [name: string]: Result;
  };
  createAt?: Date;
  updateAt?: Date;
}

const TaskSchema = new Schema<Task>(
  {
    case: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
    },
    results: Schema.Types.Mixed,
  },
  { timestamps: true },
);

const Task = models.Task || model<Task>('Task', TaskSchema);

export default Task;
