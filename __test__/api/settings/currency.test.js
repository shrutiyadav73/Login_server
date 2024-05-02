const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    name: "dollar",
    symbol: "$",
    status: "deleted",
  }
];

let defaultData = null;

module.exports = () => {
  describe("[Create Currency] [POST] /api/settings/currency", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/settings/currency")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new currency", async () => {
      await request(app)
        .post("/api/settings/currency")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

    it("Should return 400 because of duplicate entries", async () => {
      await request(app)
        .post("/api/settings/currency")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(400);

      await request(app)
        .post("/api/settings/currency")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0]);
    });
  });

  describe("[Currency List] [GET] /api/settings/currency", () => {
    it("Should return 200 and Currency list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/settings/currency")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
    });
  });

  describe("[Currency By Id] [GET] /api/settings/currency/{id}", () => {
    it("Should return 400 because invalid currency id", async () => {
      await request(app)
        .get("/api/settings/currency/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Currency object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/settings/currency/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Currency] [PUT] /api/settings/currency/{id}", () => {
    it("Should return 400 because invalid currency id", async () => {
      await request(app)
        .put("/api/settings/currency/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/settings/currency/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/settings/currency/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");

      expect({
        name: body.data.name,
        status: body.data.status,
        symbol: body.data.symbol,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Delete Currency] [DELETE] /api/settings/currency/{id}", () => {
    it("Should return 400 because invalid currency id", async () => {
      const data = await request(app)
        .delete("/api/settings/currency/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/settings/currency/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because record deleted", async () => {
      await request(app)
        .get(`/api/settings/currency/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .put(`/api/settings/currency/${defaultData.id}`)
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

  tempData.name = "Updated currency";
  tempData.status = "inactive";
  return tempData;
}
