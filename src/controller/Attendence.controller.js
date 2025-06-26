import { StatusCodes } from 'http-status-codes';
import { AttendenceModel } from '../Model/Attendence.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

export const MarkAttendance = AsyncHandler(async (req, res) => {
  const attendanceData = req.body;


  await AttendenceModel.create(attendanceData);

  return res.status(StatusCodes.CREATED).json({
    message: 'Attendance marked successfully',
  });
});
