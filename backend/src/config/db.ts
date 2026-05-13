import mongoose from 'mongoose';
import { env } from './env';

let cached: typeof mongoose | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached && mongoose.connection.readyState === 1) {
    return cached;
  }

  if (mongoose.connection.readyState === 1) {
    cached = mongoose;
    return mongoose;
  }

  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing');
  }

  try {
    cached = await mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected');
    return cached;
  } catch (error) {
    cached = null;
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}