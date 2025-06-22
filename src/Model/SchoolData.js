import { Schema, model } from 'mongoose';

const schoolDataSchema = new Schema({
  school_code: { type: String },
  school_name: { type: String },
  class: { type: String },
  section: { type: String },
  student_name: { type: String },
  srn: { type: String },
  dob: { type: String },
  gender: { type: String },
  nationality: { type: String },
  country: { type: String },
  state: { type: String },
  father_title: { type: String },
  father_name: { type: String },
  mother_title: { type: String },
  mother_name: { type: String },
  mobile: { type: String },
});

export const SchoolData = model('SchoolData', schoolDataSchema);
