const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    clientId: "CL86262",
    status: "pending",
    projectId: "PRO50843",
    indentor: "U4816141",
  },
];

let defaultData = null;

module.exports = () => {
  describe("[Create Purchase Request] [POST] /api/purchase/request", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/purchase/request")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new purchase request", async () => {
      await request(app)
        .post("/api/purchase/request")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });
  });

  describe("[Purchase Request List] [GET] /api/purchase/request", () => {
    it("Should return 200 and Request list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/purchase/request")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
      localStorage.setItem("requestId", body.data[0].id);
    });
  });

  describe("[Purchase Request By Id] [GET] /api/purchase/request/{id}", () => {
    it("Should return 400 because invalid purchase request id", async () => {
      await request(app)
        .get("/api/purchase/request/{invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Purchase Request object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/purchase/request/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Purchase Request] [PUT] /api/purchase/request/{id}", () => {
    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/purchase/request/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/purchase/request/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");

      expect({
        clientId: body.data.clientId,
        projectId: body.data.projectId,
        status: body.data.status,
        indentor: body.data.indentor,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Change Purchase Request Status] [PUT] /api/purchase/request/{id}/status", () => {
    it("Should return 400 because of invalid purchase request id", async () => {
      await request(app)
        .put("/api/purchase/request/status/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });
  });
  it("Should return 200 and update records", async () => {
    await request(app)
      .put(`/api/purchase/request/${defaultData.id}/status/`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
      .send(updatedRecords())
      .expect(200);
  });

  describe("[Delete Purchase Request] [DELETE] /api/purchase/request/{id}", () => {
    it("Should return 400 because of invalid purchase request id", async () => {
      await request(app)
        .get(`/api/purchase/request/invalidId`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/purchase/request/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because the record is deleted", async () => {
      await request(app)
        .get(`/api/purchase/request/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .put(`/api/purchase/request/invalidId`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });
  });

  describe("[Withdraw Request] [DELETE] /api/purchase/request/{id}/withdraw", () => {
    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/purchase/request/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because the record is deleted", async () => {
      await request(app)
        .get(`/api/purchase/request/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
     
    });


  });
};

function updatedRecords() {
  const tempData = {
    ...data[0],
  };

  tempData.indentor = undefined;
  tempData.clientId = "CientId";
  tempData.projectId = "Updated projectId";
  tempData.status = "pending";
  return tempData;
}
