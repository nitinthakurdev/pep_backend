import { Router } from 'express';

// locl imports
import SchoolData from './routes/SchoolData.routes.js';
import UserRoutes from './routes/User.routes.js';

const router = Router();

router.use('/school-data', SchoolData);
router.use('/user', UserRoutes);

export default router;
