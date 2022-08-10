import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const { Schema, models, model } = mongoose;

const uri = process.env.MONGODB_URI;
const options = { dbName: process.env.MONGODB_DB };

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please add your Mongo DB to .env.local');
}

const connectMongo = async () => mongoose.connect(uri, options);

const userSchema = new Schema(
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

const UserModel = models.User || model('User', userSchema);

export function createUser({ username, password, name, id }) {
  // Here you should create the user and save the salt and hashed password (some dbs may have
  // authentication methods that will do it for you so you don't have to worry about it):
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  const user = {
    // createdAt: Date.now(),
    username,
    id,
    name,
    hash,
    salt,
  };
  return user;
}

export const userDb = {
  async createUser(user) {
    await connectMongo();
    const userDoc = await UserModel.create({ ...user });
    return userDoc;
  },

  async findUsers() {
    await connectMongo();
    const users = await UserModel.find().exec();
    return users;
  },
};

async function main() {
  try {
    const users = await userDb.findUsers();
    if (users?.length) {
      console.log('Already have users in DB!\n');
      return;
    }

    const adminUser = createUser({
      // default admin user
      username: 'admin',
      password: '12345',
      id: '1',
      name: 'Admin',
    });
    const user = await userDb.createUser(adminUser);
    console.log('Created Admin Successful !\n');
    console.log('Admin user is:\n', user);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

main();
