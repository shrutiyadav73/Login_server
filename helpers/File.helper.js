const fs = require("fs");
const Logger = require("./Logger.helper");
const ll = "FileHelper";

function deleteFiles(filePaths) {
  let fileDeleteCount = 0;
  if (!Array.isArray(filePaths)) {
    filePaths = [filePaths];
  }

  filePaths.forEach((filePath) => {
    try {
      fs.unlinkSync(filePath);
      fileDeleteCount++;
    } catch (err) {}
  });

  return fileDeleteCount;
}

function createDirIfNotExits(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

function checkFileTypeSync(path) {
  try {
    const stats = fs.statSync(path);

    if (stats.isFile()) {
      return "file";
    } else if (stats.isDirectory()) {
      return "directory";
    } else {
      return "unknown";
    }
  } catch (err) {
    // Handle errors
    console.error(`Error: ${err.message}`);
    return "error";
  }
}

module.exports = {
  deleteFiles,
  createDirIfNotExits,
  checkFileTypeSync,
};
