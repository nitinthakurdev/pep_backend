import { Schema, model } from 'mongoose';

const FeedBackSchema = new Schema(
  {
    feedback: { type: Boolean, required: true },
    description: { type: String },
    class: { type: String, required: true },
    school_code: { type: String, required: true },
    section: { type: String, required: true },
  },
  { timestamps: true }
);

export const FeedBackModel = model('Feedback', FeedBackSchema);
