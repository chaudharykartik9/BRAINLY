import mongoose from 'mongoose';
import { ENV } from './env.js';

const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017/brainly';

const redactUri = (uri: string) =>
  uri.replace(/\/\/([^@/]+@)/, '//***@');

export const connectDB = async () => {
  const uris =
    ENV.NODE_ENV === 'development' && ENV.MONGO_URI.startsWith('mongodb+srv')
      ? [ENV.MONGO_URI, LOCAL_FALLBACK_URI]
      : [ENV.MONGO_URI];

  let lastError: unknown;

  for (const uri of uris) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB connected (${redactUri(uri)})`);
      return;
    } catch (error) {
      lastError = error;
      console.warn(`MongoDB connection failed for ${redactUri(uri)}`);

      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    }
  }

  console.error('MongoDB connection failed:', lastError);
  process.exit(1);
};
