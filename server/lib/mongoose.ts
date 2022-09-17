import mongoose from 'mongoose';
import '@/models'; // 必须现在初始化的时候先导入所有scheme
const uri = process.env.MONGODB_URI as string;
const options = { dbName: process.env.MONGODB_DB };

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please add your Mongo DB to .env.local');
}

const connectMongo = async () => mongoose.connect(uri, options);

export default connectMongo;
