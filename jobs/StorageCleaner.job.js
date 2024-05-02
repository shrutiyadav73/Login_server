const cron = require("node-cron");
const {StorageModel} = require("../models/");
const { deleteFiles } = require("../helpers/File.helper");

async function StorageCleaner() {
  const unusedFiles = await StorageModel.find({ inUse: false });

  if (unusedFiles.length === 0)  return;

  const unusedFilesList = unusedFiles.map(
    (file) => `${process.cwd()}/${file.path}`
  );

  if (unusedFilesList.length == deleteFiles(unusedFilesList)) {
    try {
      StorageModel.deleteMany({ inUse: false }, (err, res) => {
        console.log(res);
      });
    } catch (error) {
      console.error(error);
    }
  }

  console.log(`${unusedFilesList.length}  unused files deleted`);
}

const job = cron.schedule("0 2 * * *", StorageCleaner);

job.on("run", () => {
  console.log("Job run event");
});

console.log("Storage Cleaner Scheduled :)");

module.exports = StorageCleaner;
