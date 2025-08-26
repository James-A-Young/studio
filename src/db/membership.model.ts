import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IMembership extends Document {
  user: Types.ObjectId;
  club: Types.ObjectId;
  startDate: Date;
  endDate?: Date;
}

const MembershipSchema = new Schema<IMembership>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  club: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date }
});

export const MembershipModel = mongoose.models.Membership || model<IMembership>('Membership', MembershipSchema);
