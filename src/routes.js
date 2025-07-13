import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

// locl imports
import SchoolData from './routes/SchoolData.routes.js';
import UserRoutes from './routes/User.routes.js';
import { Autherization } from './middleware/Authentication.js';
import AttendanceRoutes from './routes/Attendance.routes.js';
import FeedBackRouter from './routes/FeedBack.routes.js';
import CancelationRoutes from "./routes/Cancelation.routes.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

const router = Router();

router.use('/school-data', Autherization, SchoolData);
router.use('/user', limiter, UserRoutes);
router.use('/attendance', Autherization, AttendanceRoutes);
router.use('/feedback', Autherization, FeedBackRouter);
router.use('/cancelation', Autherization, CancelationRoutes);
// router.get('/', GetAttendance);

export default router;
