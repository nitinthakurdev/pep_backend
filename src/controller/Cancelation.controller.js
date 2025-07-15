import { StatusCodes } from 'http-status-codes';
import { CancelationModel } from '../Model/Cancelation.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

export const CreateCancelation = AsyncHandler(async (req, res) => {
  const data = req.body;

  const cancelation = await CancelationModel.create({ ...data, school_code: req?.currentUser?.school_code });

  return res.status(StatusCodes.CREATED).json({
    message: 'Cancelation created successfully',
    data: cancelation,
  });
});
