import { Schema, models, model  } from 'mongoose';
import { PROJECT_STATUS } from '../constant'

interface ISequence {
  name: string;
  seq: number[];
}

const sequenceSchema = new Schema<ISequence>({
  name: {type: String, required: true},
  seq: [Number],
});

sequenceSchema.index({ name: 1 });

const Sequence = models.Sequence || model<ISequence>('Sequence', sequenceSchema);

export default Sequence