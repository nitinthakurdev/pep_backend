import { Router } from 'express';
import { CreateSchoolData, FilterSchoolData, getSchoolCodeAndClass, GetSchoolData } from '../controller/SchoolData.controller.js';
import { upload } from '../config/multer.config.js';

const router = Router();

router.route('/create').post(upload.single('excel'), CreateSchoolData);
router.route('/get').get(GetSchoolData);
router.route('/get-filter-data').get(FilterSchoolData);
router.route('/get-code-class').get(getSchoolCodeAndClass);

export default router;
