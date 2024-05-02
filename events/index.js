const fs = require("fs");
const path = require("path");
// Importing events
const EventEmitter = require("events");

// Initializing event emitter instances and store in the global
global.EventBus = new EventEmitter();

// Function to recursively scan a directory for JavaScript files
function includeJSFiles(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively scan subdirectories
      includeJSFiles(filePath);
    } else if (path.extname(filePath) === ".js" && file !== "index.js") {
      // Include JavaScript files except index.js
      require(filePath);
    }
  });
}

includeJSFiles(__dirname);
