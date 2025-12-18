import fs from 'fs/promises';
interface IOResponse {
  success: boolean;
  error?: string;
}

export async function moveFile(source, destinationPath): Promise<IOResponse> {
  try {
    // The fs.rename function renames a file or moves it to a new path.
    // If the destination file already exists, it will be overwritten.
    await fs.rename(source, destinationPath);
    console.log(`File moved successfully from ${source} to ${destinationPath}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error moving file:', error);

    // Common errors:
    // - ENOENT: Source file/folder doesn't exist, or destination folder doesn't exist.
    // - EXDEV: Moving across different disk drives or partitions (see alternative below).
    return { success: false, error: error.message };
  }
}

export async function downloadImage(imageUrl, savePath, retries = 5, delay = 1000){
  // console.log('Downloading image');
  //prettier-ignore
  for (let i = 0; i < retries; i++) try { 
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(savePath, buffer);
      return { success: true };
    } catch (error: any) {
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
        console.log('retrying')
      } else {
        console.error(`Failed to download image after ${retries} attempts.`);
        // throw error; // Re-throw if all retries fail
        // throw new Error( `Failed to download image after ${retries} attempts.`)
        return {success: false, error: `Failed to download image after ${retries} attempts.`};
      }
      // console.error('Error downloading the image with fetch:', error);
      // throw error;
      // return {success: false, error: error.message}
    }
}

async function checkFileExistence(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK); // F_OK checks if the file/folder exists
    return true;
  } catch (error) {
    // throw error;
    return false;
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
