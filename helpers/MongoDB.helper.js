async function setupTestMongoDB() {
  return await MongoMemoryServer.create();
}

async function getTestMongoDB() {
  const server = await setupTestMongoDB();
  return `${server.getUri()}TestDB`;
}

async function closeTestMongoDB(server) {
  await server.stop();
  // var ps = require("ps-node");
  // // A simple pid lookup
  // ps.lookup(
  //   {
  //     command: "mongodb-memory-server",
  //   },
  //   function (err, resultList) {
  //     if (err) {
  //       throw new Error(err);
  //     }

  //     resultList.forEach(function (process) {
  //       if (process) {
  //         ps.kill(process.pid, function (err) {
  //           if (err) {
  //             throw new Error(err);
  //           } else {
  //             console.log("Process %s has been killed!", process.pid);
  //           }
  //         });
  //       }
  //     });
  //   }
  // );
}

module.exports = {
  getTestMongoDB,
  closeTestMongoDB,
  setupTestMongoDB,
};
