const fs = require("fs");

const APP_STORAGE_PATH = process.env.APP_STORAGE_PATH ?? "storage";

let APP_UPLOADED_RESOURCE_PATH = `${APP_STORAGE_PATH}/upload`;

if (process.env.APP_UPLOADS_PATH)
  APP_UPLOADED_RESOURCE_PATH = process.env.APP_UPLOADED_RESOURCE_PATH;

let APP_GENERATED_RESOURCES_PATH = `${APP_STORAGE_PATH}/app`;

if (process.env.APP_GENERATED_RESOURCES_PATH)
  APP_GENERATED_RESOURCES_PATH = process.env.APP_GENERATED_RESOURCES_PATH;

if (fs.existsSync(APP_STORAGE_PATH))
  fs.mkdirSync(APP_STORAGE_PATH, { recursive: true });

if (fs.existsSync(APP_UPLOADED_RESOURCE_PATH))
  fs.mkdirSync(APP_UPLOADED_RESOURCE_PATH, { recursive: true });

if (fs.existsSync(APP_GENERATED_RESOURCES_PATH))
  fs.mkdirSync(APP_GENERATED_RESOURCES_PATH, { recursive: true });

module.exports = {
  getStoragePath: () => APP_STORAGE_PATH,
  getUploadPath: () => APP_UPLOADED_RESOURCE_PATH,
  getResourcePath: () => APP_GENERATED_RESOURCES_PATH,
  APP_STORAGE_PATH,
  APP_UPLOADED_RESOURCE_PATH,
  APP_GENERATED_RESOURCES_PATH,
};
