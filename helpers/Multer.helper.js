const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { getUploadPath } = require("../constant/Storage.constant");

module.exports = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let StorageDir = path.join(getUploadPath());
      if (req.headers?.namespace) {
        StorageDir = path.join(StorageDir, req.headers?.namespace);
        if (!fs.existsSync(StorageDir))
          fs.mkdirSync(StorageDir, { recursive: true });
      }
      cb(null, StorageDir);
    },
    filename: (req, file, cb) => {
      let NewFileName = "";
      if (req.headers?.fileprefix) {
        NewFileName += req.headers?.fileprefix + "_";
      }
      NewFileName = `${NewFileName}${Date.now()}-${file.originalname}`;
      cb(null, NewFileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const executableFileExtensions = [
      ".exe",
      ".bat",
      ".sh",
      ".cmd",
      ".com",
      ".jar",
      ".msi",
    ];
    const lowerCaseFileName = file.originalname.toLowerCase();

    // Check if the file has an executable extension
    if (
      executableFileExtensions.some((extension) =>
        lowerCaseFileName.endsWith(extension)
      )
    ) {
      // Reject the file
      cb(new Error("Executable files are not allowed"), false);
    } else {
      // Accept the file
      cb(null, true);
    }
  },
});
