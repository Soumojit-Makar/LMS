export type UserRole = 'student' | 'trainer' | 'admin';
export interface BaseUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: { publicId: string; url: string };
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
