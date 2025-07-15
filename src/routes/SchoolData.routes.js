import { Router } from 'express';
import { CreateSchoolData, DashboardData, DownloadSchoolData, FilterDataForSchool, FilterSchoolData, getSchoolCodeAndClass, GetSchoolData } from '../controller/SchoolData.controller.js';
import { upload } from '../config/multer.config.js';

const router = Router();

router.route('/create').post(upload.single('excel'), CreateSchoolData);
router.route('/get').get(GetSchoolData);
router.route('/get-filter-data').post(FilterSchoolData);
router.route('/get-code-class').get(getSchoolCodeAndClass);
router.route('/get-School-data-section').post(FilterDataForSchool);
router.route('/download-school-data').post(DownloadSchoolData);
router.route('/dashboard-data').get(DashboardData);

export default router;
