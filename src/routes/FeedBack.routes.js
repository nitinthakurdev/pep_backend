import { Router } from 'express';
import { CreateFeedBack } from '../controller/FeedBack.controller.js';

const router = Router();

router.route('/create').post(CreateFeedBack);

export default router;
