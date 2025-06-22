import { Router } from 'express';
import { CreateSchoolData, FilterSchoolData, GetSchoolData } from '../controller/SchoolData.controller.js';
import { upload } from '../config/multer.config.js';

const router = Router();

router.route('/create').post(upload.single('excel'), CreateSchoolData);
router.route('/get').get(GetSchoolData);
router.route('/get-filter-data').get(FilterSchoolData);

export default router;
