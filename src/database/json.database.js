import * as fs from 'node:fs/promises';

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    // console.log('JSON data:', jsonData.length);
    return jsonData;
  } catch (error) {
    console.error('Error reading or parsing JSON:', error);
    throw error;
  }
}

async function writeJsonFile(filePath, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2); // Pretty print JSON
    await fs.writeFile(filePath, jsonString, 'utf8');
    // console.log('JSON data written successfully.');
  } catch (error) {
    console.error('Error writing JSON:', error);
  }
}

export { readJsonFile, writeJsonFile };
