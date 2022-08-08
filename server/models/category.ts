import { Schema, models, model } from 'mongoose';

interface Category {
  title: string;
  parent?: Schema.Types.ObjectId;
  project: Schema.Types.ObjectId;
  createAt?: Date;
  updateAt?: Date;
}

const CategorySchema = new Schema<Category>({
  title: {
    type: String,
    required: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
  project: {
    type: Schema.Types.ObjectId,
    required: true,
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

CategorySchema.pre('save', function (next) {
  if (!this.createAt) {
    this.createAt = new Date();
    this.updateAt = new Date();
  } else {
    this.updateAt = new Date();
  }
  next();
});

const Category = models.Category || model<Category>('Category', CategorySchema);

export default Category;
