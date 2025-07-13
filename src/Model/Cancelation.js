import { Schema, model } from 'mongoose';

const CancelationSchema = new Schema({
    reason: { type: String, required: true },
    class: { type: String, required: true },
    school_code: { type: String, required: true },
    section: { type: String, required: true },
    cancel:{ type: Boolean, default: true}
},{timestamps: true});


export const CancelationModel = model('Cancelation', CancelationSchema);