import { Router } from 'express';
import { MarkAttendance } from '../controller/Attendence.controller.js';

const router = Router();

router.route('/mark-attendance').post(MarkAttendance);

export default router;
