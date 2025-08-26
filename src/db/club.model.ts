import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IClub extends Document {
  name: string;
  address: string;
  description?: string;
  contactEmail: string;
  disciplines: string[];
  ranges: Types.DocumentArray<IRange>;
}

export interface IRange extends Document {
  name: string;
  address: string;
  distance: number;
  firingPoints: number;
  indoor: boolean;
}

const RangeSchema = new Schema<IRange>({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  distance: { type: Number, required: true },
  firingPoints: { type: Number, required: true },
  indoor: { type: Boolean, required: true }
});

const ClubSchema = new Schema<IClub>({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true, unique: true },
  contactEmail: { type: String, required: true, unique: true },
  description: { type: String },
  disciplines: [{ type: String }],
  ranges: [RangeSchema]
});

export const ClubModel = mongoose.models.Club || model<IClub>('Club', ClubSchema);
