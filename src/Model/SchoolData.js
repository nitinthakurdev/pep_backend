import { Schema, model } from 'mongoose';

const schoolDataSchema = new Schema({
  school_code: { type: String },
  school_name: { type: String },
  class: { type: String },
  section: { type: String },
  student_name: { type: String },
  SRN: { type: String, unique: true },
  father_name: { type: String },
});

export const SchoolData = model('SchoolData', schoolDataSchema);
