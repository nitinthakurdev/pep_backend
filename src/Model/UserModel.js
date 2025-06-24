import { hash } from 'bcrypt';
import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  school_code: { type: String, required: true },
  class: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  profile: { type: String },
  refresh_token: { type: String },
  role: { type: String, required: true, enum: ['User', 'School', 'Admin'] },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const hashPass = await hash(this.password, 12);
  this.password = hashPass;
});

UserSchema.pre('findOneAndUpdate', async function (next) {
  if (!this._update.password) {
    return next();
  }
  try {
    const hashedPass = await hash(this._update.password, 15);
    this._update.password = hashedPass;
    next();
  } catch (error) {
    next(error);
  }
});

export const UserModel = model('User', UserSchema);
