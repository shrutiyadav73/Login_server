require("../configs/global.config")();
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
let server = null;
beforeAll(async () => {
  if (mongoose.connection.readyState > 0) {
    await mongoose.disconnect();
  }

  const uri = await getMongoServerUri();
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.set("strictQuery", true);
});

afterAll(async () => {
  if (mongoose.connection.readyState > 0) {
    await mongoose.disconnect();
    await server.stop();
  }
});

async function getMongoServerUri() {
  server = await MongoMemoryServer.create();
  return `${server.getUri()}test-db`;
}
