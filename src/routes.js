import { Router } from 'express';

// locl imports
import SchoolData from './routes/SchoolData.routes.js';
import UserRoutes from './routes/User.routes.js';
import { Autherization } from './middleware/Authentication.js';

const router = Router();

router.use('/school-data',Autherization, SchoolData);
router.use('/user', UserRoutes);

export default router;
