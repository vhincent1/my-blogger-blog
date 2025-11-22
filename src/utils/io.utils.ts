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

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  return { count: parseFloat((bytes / Math.pow(k, i)).toFixed(dm)), format: sizes[i] };
}

const fileSizeInMegabytes = (fileSizeInBytes) => fileSizeInBytes / (1024 * 1024);
const fileSizeInKb = (fileSizeInBytes) => (fileSizeInBytes / 1024).toFixed(1);

const fileFormat = {
  fileSizeInMegabytes,
  fileSizeInKb,
  formatBytes,
};
export { checkFileExistence, getFileSize, fileFormat };
