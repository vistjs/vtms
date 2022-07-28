import { Schema, models, model  } from 'mongoose';
import { PROJECT_STATUS } from '../constant'

interface ISequence {
  name: string;
  seq: number[];
}

const projectSchema = new Schema<ISequence>({
  name: {type: String, required: true},
  seq: [Number],
});

projectSchema.index({ name: 1 });

const Sequence = models.Sequence || model<ISequence>('Sequence', projectSchema);

export default Sequence