import { getUserData } from '../jobs/GetUserData.js';
import { UserModel } from '../Model/UserModel.js';

export const createUser = async (data) => {
  const result = await UserModel.create(data);
  return result;
};

export const FindByUsername = async (username) => {
  let data;
  data = getUserData(username);
  if (!data) {
    data = await UserModel.findOne({ username }).exec();
  }

  return data;
};

export const FindByIdAndUpdate = async (id, data) => {
  const result = await UserModel.findByIdAndUpdate(id, data, { new: true }).exec();
  return result;
};

export const FindDataById = async (id) => {
  const data = await UserModel.findById(id).select('-password -refresh_token');
  return data;
};
