import { Schema, models, model } from 'mongoose';

import { newUserSeq } from '@/utils/index';

export interface InputUser {
  username: string;
  password: string;
  name?: string;
}
export interface IUser {
  id: string;
  // createdAt: number,
  username: string;
  name: string;
  hash: string;
  salt: string;
  // password: string;
  roles?: string[];
}

const userSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    hash: { type: String, required: true },
    salt: { type: String, required: true, unique: true },
    // password: { type: String, maxLength: 10 },
    roles: { type: [String], default: [] },
  },
  { timestamps: true },
);

userSchema.index({ username: 1 });

const UserModel = models.User || model<IUser>('User', userSchema);

export const userDb = {
  async createUser(user: IUser) {
    const seqId = await newUserSeq();
    const userDoc = await UserModel.create({ ...user, id: seqId });
    return userDoc;
  },

  async findUserByUsername(username: string) {
    console.log('username in db:', username);
    const user = await UserModel.findOne({ username }).exec();
    console.log('user in db:', user);
    return user;
  },
  findUserById(id: string) {},

  updateUserById(id: string, update: IUser) {},

  deleteUser(user: IUser) {},
};

export default UserModel;
