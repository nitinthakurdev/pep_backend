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

  const classSet = new Set();
  const schoolCodeSet = new Set();
  const sectionSet = new Set();

  for (const item of schoolData) {
    if (item.class) classSet.add(item.class);
    if (item.school_code) schoolCodeSet.add(item.school_code);
    if (item.section) sectionSet.add(item.section);
  }

  const std_class_arr = Array.from(classSet).sort();
  const school_code_arr = Array.from(schoolCodeSet).sort();
  const section_arr = Array.from(sectionSet).sort();

  return res.status(StatusCodes.OK).json({
    message: 'School code and class data retrieved successfully',
    class: std_class_arr,
    school_code: school_code_arr,
    section:section_arr
  });
});
