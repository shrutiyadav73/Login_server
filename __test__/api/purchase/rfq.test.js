const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [];

let defaultData = null;

module.exports = () => {
  beforeAll(() => {
    data.push({
      prRequestId: localStorage.getItem("requestId"),
      vendorId: localStorage.getItem("vendor"),
      status: "generated",
      items: [{
          _id: "65e17962a0fd3c9c7d032f4f",
          quantity: "12",
          ipn: "IPN20230710008",
          total: "23",
          manufacturer: "Amazon",
          mpn: "MPN098765432",
          shortDescription: "I have created an item inside RFQ"
      }]
    });
  });

  describe("[Create Rfq] [POST] /api/purchase/rfq", () => {
    it("Should return 400 because of missing requested data", async () => {
      await request(app)
        .post("/api/purchase/rfq")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new rfq", async () => {
      await request(app)
        .post("/api/purchase/rfq")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

  });

  describe("[Rfq List] [GET] /api/purchase/rfq", () => {
    it("Should return 200 and Rfq list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/purchase/rfq")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
    });
  });

  describe("[Rfq By Id] [GET] /api/purchase/rfq/{id}", () => {
    it("Should return 400 because invalid rfq id", async () => {
      await request(app)
        .get("/api/purchase/rfq/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Rfq object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/purchase/rfq/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Rfq] [PUT] /api/purchase/rfq/{id}", () => {
    it("Should return 400 because of invalid rfq id", async () => {
      await request(app)
        .put("/api/purchase/rfq/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/purchase/rfq/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/purchase/rfq/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");

      expect({
        status: body.data.status,
        prRequestId: body.data.prRequestId,
        vendorId: body.data.vendorId,
        items: body.data.items,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Update Status Rfq] [PUT] /api/purchase/rfq/{id}/status", () => {
    it("Should return 400 because of invalid rfq id", async () => {
      await request(app)
        .put(`/api/purchase/rfq/invalidId/status`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and update status", async () => {
      await request(app)
        .put(`/api/purchase/rfq/${defaultData.id}/status`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });
  });

  describe("[SEND-MAIL Rfq] [POST] /api/purchase/rfq/{id}/send-mail", () => {
    it("Should return 400 because of missing requested data", async () => {
      await request(app)
        .post(`/api/purchase/rfq/${defaultData.id}/send-mail`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 because of duplicate mails that already exist in database", async () => {
      await request(app)
        .post(`/api/purchase/rfq/${defaultData.id}/send-mail`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(400);
    })
  });
};

function updatedRecords() {
  const tempData = {
    ...data[0],
  };

  tempData.status = "inactive";
  return tempData;
}
