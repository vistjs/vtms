import { Schema, models, model  } from 'mongoose';

export interface IUser {
  id: string;
  name: string;
  password: string;
  roles?: string[];
}

const userSchema = new Schema<IUser>({
  id: {type: String, required: true, unique: true},
  name: {type: String, required: true, unique: true},
  password: {type: String, maxLength: 10},
  roles:  {type: [String], default: []},
}, { timestamps: true });

userSchema.index({ name: 1 });

const UserModel = models.User || model<IUser>('User', userSchema);

export default UserModel;