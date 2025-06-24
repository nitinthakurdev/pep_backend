import XLSX from 'xlsx';

export const ExcelToJsonConverter = (filePathOrFile) => {
  try {
    let workbook;

    if (typeof filePathOrFile === 'string') {
      // ✅ You're passing req.file.path here, so use readFile
      workbook = XLSX.readFile(filePathOrFile);
    } else if (filePathOrFile?.buffer) {
      workbook = XLSX.read(filePathOrFile.buffer, { type: 'buffer' });
    } else {
      throw new Error('Invalid input: must be file path or file object with buffer');
    }

    const sheetName = workbook.SheetNames?.[0];
    if (!sheetName) throw new Error('No sheets found in Excel file.');

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    return jsonData;
  } catch (error) {
    throw new Error(`Error converting Excel to JSON: ${error.message}`);
  }
};
