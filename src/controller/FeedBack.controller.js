import { StatusCodes } from 'http-status-codes';
import { FeedBackModel } from '../Model/Feedback.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

export const CreateFeedBack = AsyncHandler(async (req, res) => {
  const data = req.body;
  const result = FeedBackModel.create({ ...data, school_code: req?.currentUser?.school_code, class: req?.currentUser?.class });
  res.status(StatusCodes.CREATED).json({
    message: 'Feedback Submited',
    result,
  });
});
