import { Schema, model } from 'mongoose';

const AttendenceSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'SchoolData', required: true },
    status: { type: String, required: true },
  },
  { timestamps: true }
);

export const AttendenceModel = model('Attendence', AttendenceSchema);
