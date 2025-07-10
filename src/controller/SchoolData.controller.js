import { StatusCodes } from 'http-status-codes';
import { SchoolData } from '../Model/SchoolData.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { NotFoundError } from '../utils/CustomError.js';
import { ExcelToJsonConverter } from '../utils/ExcelToJsonConverter.js';
import XLSX from 'xlsx';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { UserModel } from '../Model/UserModel.js';
import { FeedBackModel } from '../Model/Feedback.js';

export const CreateSchoolData = AsyncHandler(async (req, res) => {
  const ExcelFile = req.file;
  if (!ExcelFile) {
    throw new NotFoundError('Excel file not found', 'CreateSchoolData method ()');
  }

  // Read the Excel file buffer
  const jsonData = ExcelToJsonConverter(ExcelFile.path);

  await SchoolData.create(jsonData);

  fs.unlinkSync(ExcelFile.path);

  return res.status(StatusCodes.CREATED).json({
    message: 'School data created successfully',
  });
});

export const GetSchoolData = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 20;
  const skip = pages * limits;

  const schoolData = await SchoolData.find({}).sort({ _id: -1 }).limit(skip);

  return res.status(StatusCodes.OK).json({
    message: 'School data retrieved successfully',
    data: schoolData,
  });
});

export const FilterSchoolData = AsyncHandler(async (req, res) => {
  const { school_code, std_class, section, date } = req.body;

  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = (parseInt(limit) || 20) * pages;

  const selectedDate = new Date(date);

  const startOfDay = new Date(selectedDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const schoolData = await SchoolData.aggregate([
    {
      $match: {
        school_code,
        class: std_class,
        section,
      },
    },
    {
      $lookup: {
        from: 'attendences',
        localField: '_id',
        foreignField: 'studentId',
        as: 'attendanceData',
        pipeline: [
          {
            $match: {
              createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
              },
            },
          },
          {
            $project: {
              studentId: 1,
              status: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        attendanceData: { $arrayElemAt: ['$attendanceData', 0] },
      },
    },
    {
      $project: {
        school_code: 1,
        student_name: 1,
        class: 1,
        section: 1,
        father_name: 1,
        attendanceData: 1,
      },
    },
  ])
    .sort({ _id: -1 })
    .limit(limits);

  const TotalCount = await SchoolData.aggregate([
    {
      $match: {
        school_code,
        class: std_class,
        section,
      },
    },
    {
      $lookup: {
        from: 'attendences',
        localField: '_id',
        foreignField: 'studentId',
        as: 'attendanceData',
        pipeline: [
          {
            $match: {
              createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
              },
            },
          },
          {
            $project: {
              studentId: 1,
              status: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'feedbacks',
        localField: 'school_code',
        foreignField: 'school_code',
        as: 'feedback',
        pipeline: [
          {
            $match: {
              class: std_class,
              section,
              createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        attendanceData: { $arrayElemAt: ['$attendanceData', 0] },
        feedback: { $arrayElemAt: ['$feedback', 0] },
      },
    },
    {
      $project: {
        school_code: 1,
        student_name: 1,
        class: 1,
        section: 1,
        father_name: 1,
        attendanceData: 1,
        feedback: 1,
      },
    },
  ]);

  const totalData = TotalCount.length;

  const totalPresent = TotalCount.filter((item) => item?.attendanceData?.status === 'present').length || 0;
  const totalAbsent = TotalCount.filter((item) => item?.attendanceData?.status === 'absent').length || 0;

  return res.status(StatusCodes.OK).json({
    message: 'Filtered school data retrieved successfully',
    data: schoolData,
    totalData,
    totalPresent,
    totalAbsent,
    feedback: TotalCount[0]?.feedback,
  });
});

export const getSchoolCodeAndClass = AsyncHandler(async (req, res) => {
  const schoolData = await SchoolData.find();

  const result = {};

  for (const item of schoolData) {
    const schoolCode = item.school_code;
    const className = item.class;
    const sectionName = item.section;

    if (!schoolCode || !className || !sectionName) continue;

    if (!result[schoolCode]) {
      result[schoolCode] = {};
    }

    if (!result[schoolCode][className]) {
      result[schoolCode][className] = new Set();
    }

    result[schoolCode][className].add(sectionName);
  }

  // Convert Sets to Arrays for JSON response
  const formattedResult = {};

  for (const school in result) {
    formattedResult[school] = {};
    for (const cls in result[school]) {
      formattedResult[school][cls] = Array.from(result[school][cls]).sort();
    }
  }

  return res.status(StatusCodes.OK).json({
    message: 'School-wise class and section data retrieved successfully',
    data: formattedResult,
  });
});

export const GetSchoolSections = AsyncHandler(async (req, res) => {
  const data = await SchoolData.find({ $and: [{ school_code: req?.currentUser?.school_code }, { class: req?.currentUser?.class }] });
  const sectionSet = new Set();
  for (const item of data) {
    if (item.section) sectionSet.add(item.section);
  }
  const section_arr = Array.from(sectionSet).sort();
  return res.status(StatusCodes.OK).json({
    message: 'school Section data',
    data: section_arr,
  });
});

export const FilterDataForSchool = AsyncHandler(async (req, res) => {
  const { section, page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = (parseInt(limit) || 20) * pages;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const schoolData = await SchoolData.aggregate([
    {
      $match: {
        school_code: req?.currentUser?.school_code,
        section,
        class: req?.currentUser?.class,
      },
    },
    {
      $lookup: {
        from: 'attendences',
        localField: '_id',
        foreignField: 'studentId',
        as: 'attendanceData',
        pipeline: [
          {
            $match: {
              createdAt: {
                $gte: startOfToday,
                $lte: endOfToday,
              },
            },
          },
          {
            $project: {
              studentId: 1,
              status: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        attendanceData: { $arrayElemAt: ['$attendanceData', 0] },
      },
    },
  ])
    .sort({ _id: -1 })
    .limit(limits);

  const newData = schoolData.map((item) => ({
    _id: item._id,
    student_name: item.student_name,
    father_name: item.father_name,
    status: item?.attendanceData?.status || 'not-marked',
  }));

  const totalStudends = await SchoolData.find({ school_code: req?.currentUser?.school_code, section, class: req?.currentUser?.class });

  return res.status(StatusCodes.OK).json({
    message: 'Filtered school data retrieved successfully',
    data: newData,
    totalStudends: totalStudends.length,
  });
});

export const DownloadSchoolData = AsyncHandler(async (req, res) => {
  const { school_code, std_class, section, date } = req.body;

  const selectedDate = new Date(date);
  const startOfDay = new Date(selectedDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const schoolData = await SchoolData.aggregate([
    {
      $match: {
        school_code,
        class: std_class,
        section,
      },
    },
    {
      $lookup: {
        from: 'attendences',
        localField: '_id',
        foreignField: 'studentId',
        as: 'attendanceData',
        pipeline: [
          {
            $match: {
              createdAt: { $gte: startOfDay, $lte: endOfDay },
            },
          },
          {
            $project: {
              studentId: 1,
              status: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
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
              createdAt: { $gte: startOfDay, $lte: endOfDay },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        attendanceData: { $arrayElemAt: ['$attendanceData', 0] },
        feedback: { $arrayElemAt: ['$feedback', 0] },
      },
    },
    {
      $project: {
        school_code: 1,
        student_name: 1,
        class: 1,
        section: 1,
        father_name: 1,
        attendanceData: 1,
        feedback: 1,
      },
    },
  ]);

  if (!schoolData.length) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'No data found' });
  }

  const excelRows = [];

  // ✅ 1. Student Attendance Table
  schoolData.forEach((student, index) => {
    excelRows.push({
      Sr_No: index + 1,
      Name: student.student_name,
      School_Code: student.school_code,
      Class: student.class,
      Section: student.section,
      Father: student.father_name,
      Attendance: student.attendanceData?.status || '',
    });
  });

  // ✅ 2. Blank row between tables
  excelRows.push({});
  excelRows.push({ '*** फीडबैक रिपोर्ट ***': '' });

  // ✅ 3. Feedback Table with Hindi Questions as Headers
  const feedback = schoolData.find((s) => s.feedback)?.feedback;

  if (feedback) {
    excelRows.push({
      '1. आज की कक्षा में पीस एजुकेशन प्रोग्राम की कौन-सी थीम सुनाई गई?': feedback.theme || '',
      '2. कक्षा का वातावरण आपको कैसा लगा?': feedback.environment || '',
      '3. क्या सत्र के दौरान छात्रों की भागीदारी सक्रिय थी?': feedback.participation || '',
      '4. कक्षा के दौरान ऑडियो और वीडियो की गुणवत्ता कैसी थी?': feedback.audioVideo || '',
      '5. अतिरिक्त फीडबैक': feedback.additionalFeedback || '',
    });
  } else {
    excelRows.push({ फीडबैक: 'उपलब्ध नहीं है' });
  }

  // ✅ Create Excel workbook
  const ws = XLSX.utils.json_to_sheet(excelRows, { skipHeader: false });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'School_Report');

  // ✅ Write Excel file
  const filename = `attendance_${uuidv4()}.xlsx`;
  const filePath = path.join('public', 'exports', filename);
  XLSX.writeFile(wb, filePath);

  const fileUrl = `${req.protocol}://${req.get('host')}/exports/${filename}`;
  res.status(StatusCodes.OK).json({ downloadUrl: fileUrl });
});

export const DashboardData = AsyncHandler(async (req, res) => {
  const TotalSchool = await SchoolData.find({});
  const TotalUser = await UserModel.find({ role: { $ne: 'Admin' } }).countDocuments();
  const TotalReport = await FeedBackModel.countDocuments();
  const TodayReport = await FeedBackModel.find({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lte: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  }).countDocuments();

  const totalSchool = [];
  const obj = {};

  for (let item of TotalSchool) {
    if (!obj[item.school_code]) {
      obj[item.school_code] = true;
      totalSchool.push(item.school_code);
    }
  }

  return res.status(StatusCodes.OK).json({
    totalSchool: totalSchool.length,
    TotalUser,
    TodayReport,
    TotalReport,
  });
});
