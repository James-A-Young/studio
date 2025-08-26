import mongoose, { Schema, model, Document, Types } from 'mongoose';

export type MembershipRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface IMembershipRequest extends Document {
  user: Types.ObjectId;
  club: Types.ObjectId;
  status: MembershipRequestStatus;
  requestedAt: Date;
  decidedAt?: Date;
  decidedBy?: Types.ObjectId; // staff user who accepted/rejected
  reason?: string; // optional reason for rejection
}

const MembershipRequestSchema = new Schema<IMembershipRequest>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  club: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  requestedAt: { type: Date, required: true, default: Date.now },
  decidedAt: { type: Date },
  decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String }
});

export const MembershipRequestModel = mongoose.models.MembershipRequest || model<IMembershipRequest>('MembershipRequest', MembershipRequestSchema);
