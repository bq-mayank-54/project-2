import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'User' | 'Admin';
  isAccountVerified: boolean;
  verifyOtp: string;
  verifyOtpExpireAt: number;
  resetOtp: string;
  resetOtpExpireAt: number;
  googleId?: string;
  auth0Id?: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['User', 'Admin'], default: 'User' },
  isAccountVerified: { type: Boolean, default: false },
  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 },
  googleId: { type: String, default: null },
  auth0Id: { type: String, default: null },
}, {
  timestamps: true,
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
