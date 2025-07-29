import { StatusCodes } from 'http-status-codes';
import path from 'path';
import fs from 'fs/promises';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

import { SchoolData } from '../Model/SchoolData.js';
import { UserModel } from '../Model/UserModel.js';
import { FeedBackModel } from '../Model/Feedback.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { NotFoundError } from '../utils/CustomError.js';
import { ExcelToJsonConverter } from '../utils/ExcelToJsonConverter.js';

// ---------- Helper Functions ----------
const getDateRange = (date) => {
  const d = date ? new Date(date) : new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const buildAttendanceLookup = (start, end) => ({
  from: 'attendences',
  localField: '_id',
  foreignField: 'studentId',
  as: 'attendanceData',
  pipeline: [{ $match: { createdAt: { $gte: start, $lte: end } } }, { $project: { studentId: 1, status: 1, createdAt: 1 } }],
});

const buildFeedbackLookup = (school_code, std_class, section, start, end) => ({
  from: 'feedbacks',
  localField: 'school_code',
  foreignField: 'school_code',
  as: 'feedback',
  pipeline: [
    {
      $match: {
        school_code,
        class: std_class,
        section,
        createdAt: { $gte: start, $lte: end },
      },
    },
  ],
});

// ---------- Controllers ----------

export const CreateSchoolData = AsyncHandler(async (req, res) => {
  const ExcelFile = req.file;
  if (!ExcelFile) throw new NotFoundError('Excel file not found', 'CreateSchoolData');

  const jsonData = ExcelToJsonConverter(ExcelFile.path);
  try {
    const result = await SchoolData.insertMany(jsonData, { ordered: false });
    await fs.unlink(ExcelFile.path);

    res.status(StatusCodes.CREATED).json({
      message: 'School data created successfully',
      inserted: result.length,
      skipped: jsonData.length - result.length,
    });
  } catch (error) {
    await fs.unlink(ExcelFile.path);
    if (error.writeErrors) {
      return res.status(StatusCodes.CREATED).json({
        message: 'Some records were skipped due to duplicates',
        inserted: error.result?.nInserted || 0,
        skipped: error.writeErrors.length,
      });
    }
    throw error;
  }
});

export const GetSchoolData = AsyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const schoolData = await SchoolData.find({}).sort({ _id: -1 }).skip(skip).limit(limit);

  res.status(StatusCodes.OK).json({
    message: 'School data retrieved successfully',
    data: schoolData,
  });
});

export const FilterSchoolData = AsyncHandler(async (req, res) => {
  const { school_code, std_class, section, date } = req.body;
  const { start, end } = getDateRange(date);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const data = await SchoolData.aggregate([
    {
      $match: { school_code, class: std_class, section },
    },
    { $sort: { _id: -1 } },
    { $skip: skip },
    { $limit: limit },
    { $lookup: buildAttendanceLookup(start, end) },
    { $lookup: buildFeedbackLookup(school_code, std_class, section, start, end) },
    {
      $addFields: {
        attendanceData: { $arrayElemAt: ['$attendanceData', 0] },
        feedback: { $arrayElemAt: ['$feedback', 0] },
      },
    },
  ]);

  // Stats in a single query
  const totalDocs = await SchoolData.aggregate([
    { $match: { school_code, class: std_class, section } },
    { $lookup: buildAttendanceLookup(start, end) },
    {
      $addFields: { attendanceData: { $arrayElemAt: ['$attendanceData', 0] } },
    },
    {
      $group: {
        _id: null,
        totalData: { $sum: 1 },
        totalPresent: {
          $sum: { $cond: [{ $eq: ['$attendanceData.status', 'present'] }, 1, 0] },
        },
        totalAbsent: {
          $sum: { $cond: [{ $eq: ['$attendanceData.status', 'absent'] }, 1, 0] },
        },
        feedback: { $first: '$feedback' },
      },
    },
  ]);

  const stats = totalDocs[0] || { totalData: 0, totalPresent: 0, totalAbsent: 0 };

  res.status(StatusCodes.OK).json({
    message: 'Filtered school data retrieved successfully',
    data,
    totalData: stats.totalData,
    totalPresent: stats.totalPresent,
    totalAbsent: stats.totalAbsent,
    feedback: stats.feedback,
  });
});

export const getSchoolCodeAndClass = AsyncHandler(async (req, res) => {
  const schoolClassData = await SchoolData.aggregate([
    {
      $match: {
        school_code: { $ne: null },
        class: { $ne: null },
        section: { $ne: null },
      },
    },
    {
      $group: {
        _id: { school: '$school_code', class: '$class' },
        sections: { $addToSet: '$section' },
      },
    },
    {
      $group: {
        _id: '$_id.school',
        classes: {
          $push: {
            k: '$_id.class',
            v: { $sortArray: { input: '$sections', sortBy: 1 } },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        school_code: '$_id',
        classSections: { $arrayToObject: '$classes' },
      },
    },
  ]);

  const data = {};
  for (const entry of schoolClassData) {
    data[entry.school_code] = entry.classSections;
  }

  res.status(StatusCodes.OK).json({
    message: 'School-wise class and section data retrieved successfully',
    data,
  });
});

export const FilterDataForSchool = AsyncHandler(async (req, res) => {
  const { section, class: std_class } = req.body;
  const { start, end } = getDateRange();

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const school_code = req.currentUser?.school_code;

  const schoolData = await SchoolData.aggregate([
    { $match: { school_code, section, class: std_class } },
    { $sort: { _id: -1 } },
    { $skip: skip },
    { $limit: limit },
    { $lookup: buildAttendanceLookup(start, end) },
    { $lookup: buildFeedbackLookup(school_code, std_class, section, start, end) },
    {
      $addFields: {
        attendanceData: { $arrayElemAt: ['$attendanceData', 0] },
        feedback: { $arrayElemAt: ['$feedback', 0] },
      },
    },
  ]);

  const newData = schoolData.map((s) => ({
    _id: s._id,
    student_name: s.student_name,
    father_name: s.father_name,
    status: s.attendanceData?.status || 'not-marked',
  }));

  const totalStudents = await SchoolData.countDocuments({ school_code, class: std_class, section });

  res.status(StatusCodes.OK).json({
    message: 'Filtered school data retrieved successfully',
    data: newData,
    totalStudents,
    alreadySubmited: schoolData[0]?.feedback?.feedback || false,
  });
});

export const DownloadSchoolData = AsyncHandler(async (req, res) => {
  const { school_code, std_class, section, date } = req.body;
  const { start, end } = getDateRange(date);

  const schoolData = await SchoolData.aggregate([
    { $match: { school_code, class: std_class, section } },
    { $lookup: buildAttendanceLookup(start, end) },
    { $lookup: buildFeedbackLookup(school_code, std_class, section, start, end) },
    {
      $addFields: {
        attendanceData: { $arrayElemAt: ['$attendanceData', 0] },
        feedback: { $arrayElemAt: ['$feedback', 0] },
      },
    },
  ]);

  if (!schoolData.length) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'No data found' });
  }

  // Build Excel rows
  const excelRows = schoolData.map((student, i) => ({
    Sr_No: i + 1,
    Name: student.student_name,
    School_Code: student.school_code,
    Class: student.class,
    Section: student.section,
    Father: student.father_name,
    Attendance: student.attendanceData?.status || '',
  }));

  excelRows.push({}, { '*** फीडबैक रिपोर्ट ***': '' });

  const feedback = schoolData.find((s) => s.feedback)?.feedback;
  excelRows.push(
    feedback
      ? {
          '1. आज की कक्षा में थीम?': feedback.theme || '',
          '2. वातावरण?': feedback.environment || '',
          '3. भागीदारी?': feedback.participation || '',
          '4. ऑडियो/वीडियो?': feedback.audioVideo || '',
          '5. अतिरिक्त फीडबैक': feedback.additionalFeedback || '',
        }
      : { फीडबैक: 'उपलब्ध नहीं है' }
  );

  // Write Excel file
  const ws = XLSX.utils.json_to_sheet(excelRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'School_Report');

  const filename = `attendance_${uuidv4()}.xlsx`;
  const filePath = path.join('public', 'exports', filename);
  XLSX.writeFile(wb, filePath);

  const fileUrl = `${req.protocol}://${req.get('host')}/exports/${filename}`;
  res.status(StatusCodes.OK).json({ downloadUrl: fileUrl });
});

export const DashboardData = AsyncHandler(async (req, res) => {
  const { start, end } = getDateRange();

  const [uniqueSchoolCodes, TotalUser, TotalReport, TodayReport] = await Promise.all([
    SchoolData.distinct('school_code'),
    UserModel.countDocuments({ role: { $ne: 'Admin' } }),
    FeedBackModel.countDocuments(),
    FeedBackModel.countDocuments({ createdAt: { $gte: start, $lte: end } }),
  ]);

  res.status(StatusCodes.OK).json({
    totalSchool: uniqueSchoolCodes.length,
    TotalUser,
    TodayReport,
    TotalReport,
  });
});
