import mongoose from 'mongoose'


const uri = process.env.MONGODB_URI as string;
const options = {dbName: process.env.MONGODB_DB};

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please add your Mongo DB to .env.local')
}

const connectMongo = async () => mongoose.connect(uri, options);

export default connectMongo