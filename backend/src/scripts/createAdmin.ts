import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  if (!process.env.MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI);
  // Inline model to avoid import issues in script context
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: String, email: { type: String, unique: true }, password: String,
    role: { type: String, default: 'admin' }, trainerApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, refreshTokens: [String],
  }, { timestamps: true }));

  const email = process.env.ADMIN_EMAIL || '';
  const password = process.env.ADMIN_PASSWORD || '';

  const existing = await User.findOne({ email });
  if (existing) { console.log('Admin already exists:', email); process.exit(0); }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name: 'Super Admin', email, password: hashed, role: 'admin', isActive: true, refreshTokens: [] });
  console.log('✅ Admin created:', email);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
