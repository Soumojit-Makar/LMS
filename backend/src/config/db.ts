import mongoose from 'mongoose';
import { env } from './env';

let cached: typeof mongoose | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached && mongoose.connection.readyState === 1) return cached;

  try {
    cached = await mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected');
    return cached;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}
