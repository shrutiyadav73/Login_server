const fs = require("fs");
const router = require("express").Router();
const { checkFileTypeSync } = require("../helpers/File.helper");
const { requestSuccess } = require("../helpers/RequestResponse.helper");

/* This is a function that is exporting a router. */
module.exports = function () {
  router.get("/", () => {
    requestSuccess(res);
  });

  includeRoutersFromDir(router, "", `${process.cwd()}/routers`);

  return router;
};

function includeRoutersFromDir(router, path, dir) {
  fs.readdirSync(dir).forEach((file) => {
    if (file !== "index.js" && file.includes(".router.js")) {
      try {
        const urlPath = `${path}/${file.split(".")[0].toLowerCase()}`;
        const routerPath = `${dir}/${file.replace(".js", "")}`;
        router.use(urlPath, require(routerPath));
      } catch (err) {
        console.error(`File Name : ${file}  ${err}`);
      }
      return;
    }

    if (checkFileTypeSync(`${dir}/${file}`) === "directory") {
      includeRoutersFromDir(router, `${path}/${file}`, `${dir}/${file}`);
    }
  });
}
