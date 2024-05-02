const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

let data = null;

let defaultData = null;

module.exports = () => {
  beforeAll(() => {
    data = [
      {
        name: "CRwwM",
        clientId: localStorage.getItem("client"),
        status: "active",
      },
      {
        name: "HwwRMS",
        clientId: localStorage.getItem("client"),
        status: "active",
      },
    ];
  });

  describe("[Create Project] [POST] /api/purchase/project", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/purchase/project")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new project", async () => {
      await request(app)
        .post("/api/purchase/project")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

    it("Should return 400 because of duplicate project name that already exist in database", async () => {
      await request(app)
        .post("/api/purchase/project")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(400);

      await request(app)
        .post("/api/purchase/project")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[1]);
    });
  });

  describe("[Project List] [GET] /api/purchase/project", () => {
    it("Should return 200 and Project list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/purchase/project")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
    });
  });

  describe("[Project By Id] [GET] /api/purchase/project/{id}", () => {
    it("Should return 400 because invalid project id", async () => {
      await request(app)
        .get("/api/purchase/project/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Project object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/purchase/project/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      // expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Project] [PUT] /api/purchase/project/{id}", () => {
    it("Should return 400 because of invalid project id", async () => {
      await request(app)
        .put("/api/purchase/project/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/purchase/project/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/purchase/project/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");
      expect({
        name: body.data.name,
        status: body.data.status,
        clientId: body.data.clientId,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Delete Project] [DELETE] /api/purchase/project/{id}", () => {
    it("Should return 400 because of invalid project id", async () => {
      await request(app)
        .delete("/api/purchase/project/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/purchase/project/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because the record is deleted", async () => {
      await request(app)
        .get(`/api/purchase/project/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .put(`/api/purchase/project/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });
  });
};

function updatedRecords() {
  const tempData = {
    ...data[0],
  };

  tempData.name = "Updated Project";
  tempData.status = "inactive";
  tempData.clientId = "clientId";
  return tempData;
}

// ================================================================================================
