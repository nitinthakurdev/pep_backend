import { Schema, model } from 'mongoose';

const FeedBackSchema = new Schema(
  {
    feedback: { type: Boolean, required: true },
    theme: { type: String, required: true },
    environment: { type: String, required: true },
    participation: { type: String, required: true },
    audioVideo: { type: String, required: true },
    additionalFeedback: { type: String },
    class: { type: String, required: true },
    school_code: { type: String, required: true },
    section: { type: String, required: true },
  },
  { timestamps: true }
);

export const FeedBackModel = model('Feedback', FeedBackSchema);
