import { Router } from 'express';

// locl imports
import SchoolData from './routes/SchoolData.routes.js';
import UserRoutes from './routes/User.routes.js';
import { Autherization } from './middleware/Authentication.js';
import AttendanceRoutes from './routes/Attendance.routes.js';
import { DashboardData } from './controller/SchoolData.controller.js';
import FeedBackRouter from "./routes/FeedBack.routes.js";

const router = Router();

router.use('/school-data', Autherization, SchoolData);
router.use('/user', UserRoutes);
router.use('/attendance', AttendanceRoutes);
router.use('/feedback', Autherization, FeedBackRouter);
router.get('/', DashboardData);

export default router;
