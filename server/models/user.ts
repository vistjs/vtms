import { Schema, models, model, Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import conn from '@/lib/mongoose';
import { IRole } from './role';
export interface InputUser {
  username: string;
  password: string;
  name?: string;
}
export interface IUser {
  username: string;
  name: string;
  hash: string;
  salt: string;
  isAdmin: boolean;
  roles?: IRole[];
}

export type DocumentIUser = HydratedDocument<IUser>;

export interface ResponseUser extends DocumentIUser {
  roles?: IRole[];
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    hash: { type: String, required: true },
    salt: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, required: true },
  },
  { timestamps: true },
);

userSchema.index({ username: 1 });

const UserModel = models.User || model<IUser>('User', userSchema);

export const userDb = {
  async createUser(user: IUser) {
    await conn();
    const userDoc = await UserModel.create(user);
    return userDoc;
  },

  async findUserByUsername(username: string) {
    console.log('username in db:', username);
    await conn();
    const user = await UserModel.findOne({ username }).exec();
    console.log('user in db:', user);
    return user;
  },
  findUserById(id: string) {},

  updateUserById(id: string, update: IUser) {},

  deleteUser(user: IUser) {},
};

export default UserModel;
