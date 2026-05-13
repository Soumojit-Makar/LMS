import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'trainer' | 'admin';
  trainerApproved: boolean;
  trainerAppliedAt?: Date;
  avatar?: { publicId: string; url: string };
  bio?: string;
  refreshTokens: string[];
  isActive: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'trainer', 'admin'], default: 'student' },
    trainerApproved: { type: Boolean, default: false },
    trainerAppliedAt: { type: Date },
    avatar: { publicId: String, url: String },
    bio: { type: String, maxlength: 500 },
    refreshTokens: { type: [String], select: false, default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1, trainerApproved: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshTokens;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
