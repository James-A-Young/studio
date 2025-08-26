
import mongoose, { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  
  displayName: string;
  placeOfBirth: string;
  dateOfBirth: Date;
  address: string;
  facNumber?: string;
  facExpiry?: Date;
  sgcNumber?: string;
  sgcExpiry?: Date;
  updatedAt: Date;
  onSystem: boolean;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, trim: true },
  displayName: { type: String, required: false, trim: true },
  placeOfBirth: { type: String, required: false },
  dateOfBirth: { type: Date, required: false },
  address: { type: String, required: false },
  facNumber: { type: String, required: false, trim: true },
  facExpiry: { type: Date, required: false },
  sgcNumber: { type: String, required: false, trim: true },
  sgcExpiry: { type: Date, required: false },
  updatedAt: { type: Date, required: true, default: Date.now },
  onSystem: { type: Boolean, required: true, default: true }
});

export const UserModel = mongoose.models.User || model<IUser>('User', UserSchema);
