import { hash } from 'bcrypt';
import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  school_code: { type: String },
  class: { type: String },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  profile: { type: String },
  refresh_token: { type: String },
  role: { type: String, required: true, enum: ['User', 'School', 'Admin'] },
  name:{type:String,trim:true,},
  email:{type:String,unique:true},
  phone:{type:String},
  city:{type:String},
  state:{type:String},
  language:{type:String,enum:["English","Hindi"]},
  alt_phone:{type:String}
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
