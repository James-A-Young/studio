
import { number } from 'zod';
import { geocodeAddress } from '../lib/geocode';
import { AddressSchema, IAddress, addressChanged } from './address.model';
import mongoose, { Schema, model, Document, Types } from 'mongoose';
export enum Discipline {
  PISTOL = 'Pistol',
  FULLRIFLE = 'Fullbore Rifle',
  SMALLRIFLEPRONE = 'Smallbore Rifle - Prone',
  SMALLRIFLE3P = 'Smallbore Rifle - 3 Positions',
  SMALLRIFLEBENCH = 'Smallbore Rifle - Bench Rest',
  SPORTINGCLAY = 'Shotgun Sporting',
  SKEETCLAYY = 'Shotgun SKEET',
  DTLSKEET = 'Shotgun DTL',
  AIRGUN = 'Airgun',
  AIRPISTOL = 'Air Pistol',
}
export enum Distance{
    yrds10 = "10 Yards",
    yrds20 = "20 Yards",
    yrds25 = "25 Yards",
    yrds50 = "50 Yards",
    yrds100 = "100 Yards",
    mtrs25 = "25 Meters",
    mtrs50 = "50 Meters",
    mtrs100 = "100 Meters",
}


export interface IEvent {
  description: string;
  date?: Date;
  dayOfWeek?: string; // e.g. 'Monday', 'Tuesday', etc.
  startTime: string; // e.g. '18:00'
  endTime: string;   // e.g. '20:00'
}

export interface INews {
  title: string;
  author: mongoose.Types.ObjectId; // ref to User
  published: Date;
  markdownBody: string;
}

export interface IClub extends Document {
  name: string;
  address: IAddress;
  description?: string;
  contactEmail: string;
  disciplines: Discipline[];
  ranges: Types.DocumentArray<IRange>;
  website?: string;
  includeInSearch: boolean;
  allowJoinRequest: boolean;
  established?: number;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  events?: IEvent[];
  news?: INews[];
  bannerUrl:string,
  logoUrl:string,
}
// News subdocument schema
const NewsSchema = new Schema<INews>({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  published: { type: Date, required: true },
  markdownBody: { type: String, required: true },
}, { _id: true, timestamps: false });
// Event subdocument schema
const EventSchema = new Schema<IEvent>({
  description: { type: String, required: true },
  date: { type: Date },
  dayOfWeek: { type: String },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
}, { _id: false });

export interface IRange extends Document {
  name: string;
  address: IAddress;
  disciplines: Discipline[];
  distances: Distance[];
  firingPoints: number;
  indoor: boolean;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}


const GeoJSONPoint = {
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [lng, lat]
    required: true,
    default: [0, 0],
  },
};

const RangeSchema = new Schema<IRange>({
  name: { type: String, required: true },
  address: { type: AddressSchema, required: true },
  location: GeoJSONPoint,
  disciplines: { type: [String], enum: Object.values(Discipline), required: true },
  distances: { type: [String], enum: Object.values(Distance), required: true },
  firingPoints: { type: Number, required: true },
  indoor: { type: Boolean, required: true }
});

// Pre-save hook for geocoding range address and setting location
RangeSchema.pre('save', async function (next) {
  // @ts-ignore
  const range = this;
  if (addressChanged(range) && range.address) {
    const addr = range.address;
    const query = [addr.address, addr.city, addr.postcode, addr.country].filter(Boolean).join(', ');
    const geo = await geocodeAddress(query);
    if (geo) {
      range.location = { type: 'Point', coordinates: [geo.longitude, geo.latitude] };
    }
  }
  next();
});


const ClubSchema = new Schema<IClub>({
  name: { type: String, required: true, unique: true },
  address: { type: AddressSchema, required: true },
  location: GeoJSONPoint,
  contactEmail: { type: String, required: false },
  description: { type: String },
  disciplines: [{ type: String, enum: Object.values(Discipline), required: true }],
  ranges: [RangeSchema],
  website: { type: String },
  established: { type: Number },
  events: { type: [EventSchema], default: [] },
  news: { type: [NewsSchema], default: [] },
  includeInSearch: { type: Boolean, default: true },
  allowJoinRequest: { type: Boolean, default: true },
  bannerUrl: { type: String },
  logoUrl: { type: String },
});

ClubSchema.index({ location: '2dsphere' });

// Pre-save hook for geocoding club and embedded range addresses, and setting location
ClubSchema.pre('save', async function (next) {
  // @ts-ignore
  const club = this;
  // Geocode club address if changed
  if (addressChanged(club)) {
    const addr = club.address;
    const query = [addr.address, addr.city, addr.postcode, addr.country].filter(Boolean).join(', ');
    const geo = await geocodeAddress(query);
    if (geo) {
      club.location = { type: 'Point', coordinates: [geo.longitude, geo.latitude] };
    }
  }
  // Geocode embedded ranges if their address fields have changed
  if (Array.isArray(club.ranges)) {
    for (const range of club.ranges) {
      if (range && range.address && addressChanged(range)) {
        const raddr = range.address;
        const rquery = [raddr.address, raddr.city, raddr.postcode, raddr.country].filter(Boolean).join(', ');
        const rgeo = await geocodeAddress(rquery);
        if (rgeo) {
          range.location = { type: 'Point', coordinates: [rgeo.longitude, rgeo.latitude] };
        }
      }
    }
  }
  next();
});


export const ClubModel = mongoose.models.Club || model<IClub>('Club', ClubSchema);
