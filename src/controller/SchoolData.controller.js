import { StatusCodes } from 'http-status-codes';
import { SchoolData } from '../Model/SchoolData.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { NotFoundError } from '../utils/CustomError.js';
import { ExcelToJsonConverter } from '../utils/ExcelToJsonConverter.js';

export const CreateSchoolData = AsyncHandler(async (req, res) => {
  const ExcelFile = req.file;
  if (!ExcelFile) {
    throw new NotFoundError('Excel file not found', 'CreateSchoolData method ()');
  }

  // Read the Excel file buffer
  const jsonData = ExcelToJsonConverter(ExcelFile.path);

  const result = await SchoolData.create(jsonData);

  return res.status(StatusCodes.CREATED).json({
    message: 'School data created successfully',
    data: result,
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
  const { school_code, std_class, section } = req.body;
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = (parseInt(limit) || 20) * pages;

  const schoolData = await SchoolData.find({
    $and: [{ school_code }, { section }, { class: std_class }],
  })
    .sort({ _id: -1 })
    .limit(limits);

  return res.status(StatusCodes.OK).json({
    message: 'Filtered school data retrieved successfully',
    data: schoolData,
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

  const schoolData = await SchoolData.find({
    $and: [{ school_code: req?.currentUser?.school_code }, { section }, { class: req?.currentUser?.class }],
  })
    .select('student_name father_name')
    .sort({ _id: -1 })
    .limit(limits);

  console.log(schoolData);

  return res.status(StatusCodes.OK).json({
    message: 'Filtered school data retrieved successfully',
    data: schoolData,
  });
});
