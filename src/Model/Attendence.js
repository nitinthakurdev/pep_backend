import { Schema, model } from 'mongoose';

const AttendenceSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'SchoolData' },
    isPresent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AttendenceModel = model('Attendence', AttendenceSchema);
