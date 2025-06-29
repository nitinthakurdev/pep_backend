import { StatusCodes } from "http-status-codes";
import { FeedBackModel } from "../Model/Feedback.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";


export const CreateFeedBack = AsyncHandler(async (req,res) => {
    const data = req.body;
    console.log(data)
    const result = FeedBackModel.create({...data,creator:req?.currentUser?._id});
    res.status(StatusCodes.CREATED).json({
        message:"Feedback Submited",
        result
    })
});