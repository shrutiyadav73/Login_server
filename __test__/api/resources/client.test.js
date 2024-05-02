const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    name: "Ajay Singh",
    address: "Lucknow",
    city: "Lucknow",
    state: "UP",
    country: "India",
    pincode: "226001",
    status: "active",
  },
  {
    name: "Ajay kumar Singh",
    address: "Lucknow",
    city: "Lucknow",
    state: "UP",
    country: "India",
    pincode: "226001",
    status: "active",
  },
];

let defaultData = null;

module.exports = () => {
  describe("[Create Client] [POST] /api/resources/client", () => {
    it("Should return 400 because of missing requested data", async () => {
      await request(app)
        .post("/api/resources/client")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new client", async () => {
      await request(app)
        .post("/api/resources/client")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

    it("Should return 400 because of duplicate client name that already exist in database", async () => {
      await request(app)
        .post("/api/resources/client")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(400);

      await request(app)
        .post("/api/resources/client")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[1]);
    });
  });
  describe("[Client List] [GET] /api/resources/client", () => {
    it("Should return 200 and Client list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/resources/client")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      localStorage.setItem("client", body.data[0].id);
      defaultData = body.data[0];
    });
  });

  describe("[Client By Id] [GET] /api/resources/client/{id}", () => {
    it("Should return 400 because invalid client id", async () => {
      await request(app)
        .get("/api/resources/client/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Client object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/resources/client/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      // expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Client] [PUT] /api/resources/client/{id}", () => {
    it("Should return 400 because of invalid client id", async () => {
      await request(app)
        .put("/api/resources/client/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/resources/client/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/resources/client/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");
      expect({
        name: body.data.name,
        address: body.data.address,
        city: body.data.city,
        status: body.data.status,
        state: body.data.state,
        country: body.data.country,
        pincode: body.data.pincode,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Delete Clientl] [DELETE] /api/resources/client/{id}", () => {
    it("Should return 400 because of invalid client id", async () => {
      await request(app)
        .delete("/api/resources/client/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/resources/client/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because the record is deleted", async () => {
      await request(app)
        .get(`/api/resources/client/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .put(`/api/resources/client/${defaultData.id}`)
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

  tempData.name = "Updated name";
  tempData.status = "inactive";
  return tempData;
}
