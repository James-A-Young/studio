import mongoose, { Schema, model, Document, Types } from 'mongoose';

export type FireArmType = "rifle" | "pistol" | "shotgun" | "other";

export interface IFirearm extends Document {
  name: string;
  calibre: string;
  type: FireArmType;
  ownerUser?: Types.ObjectId;
  ownerClub?: Types.ObjectId;
}

const FirearmSchema = new Schema<IFirearm>({
  name: { type: String, required: true },
  calibre: { type: String, required: true },
  type: { type: String, enum: ["rifle", "pistol", "shotgun", "other"], required: true },
  ownerUser: { type: Schema.Types.ObjectId, ref: 'User' },
  ownerClub: { type: Schema.Types.ObjectId, ref: 'Club' }
});

export const FirearmModel = mongoose.models.Firearm || model<IFirearm>('Firearm', FirearmSchema);
