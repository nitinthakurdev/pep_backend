import { Router } from 'express';

// locl imports
import SchoolData from './routes/SchoolData.routes.js';

const router = Router();

router.use('/school-data', SchoolData);

export default router;
