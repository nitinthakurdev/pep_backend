import { StatusCodes } from "http-status-codes";
import { AttendenceModel } from "../Model/Attendence.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";


export const MarkAttendance = AsyncHandler(async (req, res) => {
  const { studentId, isPresent } = req.body;

  if (!studentId || typeof isPresent !== 'boolean') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Invalid input data',
    });
  }

  const attendanceData = {
    studentId,
    isPresent,
  };

  const attendance = await AttendenceModel.create(attendanceData);

  return res.status(StatusCodes.CREATED).json({
    message: 'Attendance marked successfully',
    data: attendance,
  });
})