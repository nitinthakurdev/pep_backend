import {Schema,model} from "mongoose";


const FeedBackSchema = new Schema ({
    feedback:{type:Boolean,required:true},
    description:{type:String},
    creator:{type:Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true});


export const FeedBackModel = model("Feedback",FeedBackSchema)