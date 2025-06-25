import { Router } from 'express';
import { CreateSchoolData, FilterDataForSchool, FilterSchoolData, getSchoolCodeAndClass, GetSchoolData, GetSchoolSections } from '../controller/SchoolData.controller.js';
import { upload } from '../config/multer.config.js';

const router = Router();

router.route('/create').post(upload.single('excel'), CreateSchoolData);
router.route('/get').get(GetSchoolData);
router.route('/get-filter-data').get(FilterSchoolData);
router.route('/get-code-class').get(getSchoolCodeAndClass);
router.route('/get-filtered-section').get(GetSchoolSections);
router.route('/get-School-data-section').get(FilterDataForSchool);

export default router;
