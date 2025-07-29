import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';

// local imports
import { createUser, FindByIdAndUpdate, FindByUsername, FindDataById } from '../services/User.services.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { BadRequestError, NotFoundError } from '../utils/CustomError.js';
import { SignToken } from '../utils/JWTHandler.js';

export const TokensGenerater = (payload, type) => {
  const access_token = SignToken(payload, type !== 'mobile' && '2day');
  const refresh_token = SignToken(payload, type !== 'mobile' && '3day');
  return { access_token, refresh_token };
};

export const CreateUser = AsyncHandler(async (req, res) => {
  const data = req.body;

  const exist = await FindByUsername(data.username);

  if (exist) {
    throw new NotFoundError('Username already Register', 'CreateUser method ()');
  }

  const result = await createUser(data);

  return res.status(StatusCodes.CREATED).json({
    message: 'User register successfully',
    data: result,
  });
});

export const LoginUser = AsyncHandler(async (req, res) => {
  const { username, password, type } = req.body;
  const user = await FindByUsername(username);
  if (!user) {
    throw new NotFoundError('Bad Credintial', 'LoginUser method ()');
  }
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    throw new NotFoundError('Bad Credintial', 'LoginUser method ()');
  }
  const { access_token, refresh_token } = TokensGenerater({ username: user.username }, type);

  await FindByIdAndUpdate(user._id, { refresh_token });

  return res.status(StatusCodes.OK).json({
    message: 'Login Successfull',
    access_token,
    refresh_token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

export const LogedInUser = AsyncHandler(async (req, res) => {
  const id = req.currentUser._id;
  const data = await FindDataById(id);
  return res.status(StatusCodes.OK).json({
    data,
  });
});

export const ChangePassword = AsyncHandler(async (req,res) => {
  const {oldPassword,newPassword} = req.body;
  const user = req?.currentUser;
  if(!user){
    throw new NotFoundError("user not found","ChangePassword method ()");
  }

  const isCurrectPassword = bcrypt.compareSync(oldPassword,user?.password);
  if(!isCurrectPassword){
    throw new BadRequestError("Password does not match","ChangePassword method ()");
  }

  await FindByIdAndUpdate(user._id,{password:newPassword});
  return res.status(StatusCodes.OK).json({
    message:"User password updated successful"
  })
});
