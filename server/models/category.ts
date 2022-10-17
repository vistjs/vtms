import { Schema, models, model } from 'mongoose';

interface Category {
  title: string;
  parent?: Schema.Types.ObjectId;
  project: Schema.Types.ObjectId;
  createAt?: Date;
  updateAt?: Date;
}

const CategorySchema = new Schema<Category>(
  {
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
  },
  { timestamps: true },
);

const Category = models.Category || model<Category>('Category', CategorySchema);

export default Category;
