import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  user: Types.ObjectId;
  club: Types.ObjectId;
  timeIn: Date;
  timeOut?: Date;
  reason: string;
  clubRepresented?: Types.ObjectId;
  firearmUsed?: Types.ObjectId;
}

const AttendanceSchema = new Schema<IAttendance>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  club: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
  timeIn: { type: Date, required: true },
  timeOut: { type: Date },
  reason: { type: String, required: true },
  clubRepresented: { type: Schema.Types.ObjectId, ref: 'Club' },
  firearmUsed: { type: Schema.Types.ObjectId, ref: 'Firearm' }
});

export const AttendanceModel = mongoose.models.Attendance || model<IAttendance>('Attendance', AttendanceSchema);
