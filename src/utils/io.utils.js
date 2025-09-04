import fs from 'fs/promises';

async function checkFileExistence(filePath) {
  try {
    await fs.access(filePath); //, fs.constants.F_OK); // F_OK checks if the file/folder exists
    // return true;
  } catch (error) {
    // throw error;
    // return false
  }
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
  } catch (err) {
    // throw err; // Re-throw the error for handling by the caller
    return 0;
  }
}

const fileSizeInMegabytes = (fileSizeInBytes) => fileSizeInBytes / (1024 * 1024);
const fileSizeInKb = (fileSizeInBytes) => (fileSizeInBytes / 1024).toFixed(1);

const fileFormat = {
  fileSizeInMegabytes,
  fileSizeInKb,
};
export { checkFileExistence, getFileSize, fileFormat };
