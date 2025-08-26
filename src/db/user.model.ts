import { geocodeAddress } from '../lib/geocode';
import { addressChanged } from './address.model';
import mongoose, { Schema, model, Document } from 'mongoose';
import { AddressSchema, IAddress } from './address.model';

export interface IUser extends Document {
  email: string;
  displayName: string;
  placeOfBirth: string;
  dateOfBirth: Date;
  address?: IAddress;
  facNumber?: string;
  facExpiry?: Date;
  sgcNumber?: string;
  sgcExpiry?: Date;
  updatedAt: Date;
  onSystem: boolean;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, trim: true },
  displayName: { type: String, required: false, trim: true },
  placeOfBirth: { type: String, required: false },
  dateOfBirth: { type: Date, required: false },
  address: { type: AddressSchema, required: false },
  facNumber: { type: String, required: false, trim: true },
  facExpiry: { type: Date, required: false },
  sgcNumber: { type: String, required: false, trim: true },
  sgcExpiry: { type: Date, required: false },
  updatedAt: { type: Date, required: true, default: Date.now },
  onSystem: { type: Boolean, required: true, default: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: false,
      default: [0, 0],
    },
  },
});

// Pre-save hook for geocoding user address and setting location
UserSchema.pre('save', async function (next) {
  // @ts-ignore

  const user = this;
  if (addressChanged(user) && user.address) {
    const addr = user.address;
    const query = [addr.address, addr.city, addr.postcode, addr.country].filter(Boolean).join(', ');
    const geo = await geocodeAddress(query);
    if (geo) {
      user.location = { type: 'Point', coordinates: [geo.longitude, geo.latitude] };
    }
  }
  next();
});

// Pre-findOneAndUpdate hook for geocoding user address and setting location
UserSchema.pre('findOneAndUpdate', async function (next) {
  // @ts-ignore;
  // this.getUpdate() is the update object
  const update = this.getUpdate();
  // Only handle UpdateQuery, not aggregation pipeline
  if (update && typeof update === 'object' && !Array.isArray(update)) {
    let address = null;
    if (update.$set && update.$set.address) {
      address = update.$set.address;
    } else if (update.address) {
      address = update.address;
    }
    if (address) {
      const query = [address.address, address.city, address.postcode, address.country].filter(Boolean).join(', ');
      const geo = await geocodeAddress(query);
      if (geo) {
        if (update.$set) {
          update.$set.location = { type: 'Point', coordinates: [geo.longitude, geo.latitude] };
        } else {
          update.location = { type: 'Point', coordinates: [geo.longitude, geo.latitude] };
        }
        this.setUpdate(update);
      }
    }
  }
  next();
});

export const UserModel = mongoose.models.User || model<IUser>('User', UserSchema);
