import mongoose, { Schema, model, Document, Types } from 'mongoose';

export type ClubRole = "secretary" | "chair" | "vicechair" | "manager" | "viewer";

export interface IClubRoleAssignment extends Document {
  user: Types.ObjectId;
  club: Types.ObjectId;
  role: ClubRole;
  startDate: Date;
  endDate?: Date;
}

const ClubRoleAssignmentSchema = new Schema<IClubRoleAssignment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  club: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
  role: { type: String, enum: ["secretary", "chair", "vicechair", "manager", "viewer"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date }
});

export const ClubRoleAssignmentModel = mongoose.models.ClubRoleAssignment || model<IClubRoleAssignment>('ClubRoleAssignment', ClubRoleAssignmentSchema);
