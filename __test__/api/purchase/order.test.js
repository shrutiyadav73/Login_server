const { stat } = require("fs-extra");
const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

let data = null;

let defaultData = null;

module.exports = () => {
  beforeAll(() => {
    data = [
      {
        status: "in_approval",
        prId: localStorage.getItem("requestId"),
        vendorId: localStorage.getItem("vendor"),
        // termsAndCondition: [{
        //     tncId: "T01223",
        // },
        // ],
        poVerifierId: "U4816141",
        voucherNumber: "VN1234",
        quotationId: localStorage.getItem("quotationId"),
        // items: [{
        //     ipn: "IPN20230710003",
        //     description: " printed circuit board",
        //     quantity: "1000",
        //     poQuantity: "100",
        //     quotedQuantity: "20",
        //     rate: "3500",
        //     quotationId: "QUO20230728003",
        //     tax: "3",
        //     total: "3605000"
        // }
        // ],
      },
    ];
  });

  describe("[Create Order] [POST] /api/purchase/order", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/purchase/order")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new order", async () => {
      await request(app)
        .post("/api/purchase/order")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

    it("Should return 400 because of duplicate order that already exist in database", async () => {
      await request(app)
        .post("/api/purchase/order")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(400);

      await request(app)
        .post("/api/purchase/order")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0]);
    });
  });

  describe("[Order List] [GET] /api/purchase/order", () => {
    it("Should return 200 and Order list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/purchase/order")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
    });
  });

  describe("[Order By Id] [GET] /api/purchase/order/{id}", () => {
    it("Should return 400 because invalid order id", async () => {
      await request(app)
        .get("/api/purchase/order/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Order object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/purchase/order/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      // expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Order] [PUT] /api/purchase/order/{id}", () => {
    it("Should return 400 because of invalid order id", async () => {
      await request(app)
        .get("/api/purchase/order/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/purchase/order/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/purchase/order/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");
      expect({
        prId: body.data.prId,
        status: body.data.status,
        vendorId: body.data.vendorId,
        poVerifierId: body.data.poVerifierId,
        voucherNumber: body.data.voucherNumber,
        quotationId: body.data.quotationId,
        // items: body.data.items,
        // termsAndCondition: body.data.termsAndCondition,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Delete Order] [DELETE] /api/purchase/order/{id}", () => {
    it("Should return 400 because of invalid order id", async () => {
      await request(app)
        .get(`/api/purchase/order/invalidId`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/purchase/order/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because the record is deleted", async () => {
      await request(app)
        .get(`/api/purchase/order/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .get(`/api/purchase/order/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });
  });

  describe("[Correct Order] [PUT] /api/purchase/order/{id}/correction", () => {
    it("Should return 400 because of invalid order id", async () => {
      await request(app)
        .get(`/api/purchase/order/invalidId`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/purchase/order/${defaultData.id}/correction`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });
  });

  describe("[Update Order Status] [PUT] /api/purchase/order/{id}/status", () => {
    it("Should return 400 because of invalid order id", async () => {
      await request(app)
        .get(`/api/purchase/order/invalidId`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });
  });
};``

function updatedRecords() {
  const tempData = {
    ...data[0],
  };

  tempData.prId = "Updated Order";
  tempData.status = "inactive";
  tempData.vendorId = "vendorId";
  // tempData.items = "items";

  return tempData;
}
