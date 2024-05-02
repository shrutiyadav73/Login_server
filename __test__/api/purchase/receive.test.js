const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    // items: [
    //   {
    //     ipn: "IPN20230710001",
    //     quantity: "22",
    //     shortDescription: "New addition",
    //     basePrice: "3222",
    //     gst: "1766",
    //     customDuty: "242",
    //     frightCharges: "222",
    //   },
    // ],
    purchaseOrderId: "PO2024029007",
    otherCharges: "344",
    itemsTotal: "23",
    taxInvoiceNumber: "T2187498327",
    taxInvoiceDate: "1515",
    taxTotal: "222",
    taxGst: "9999999",
  },
];

let defaultData = null;

module.exports = () => {
  describe("[Create Purchase Receive] [POST] /api/purchase/receive", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/purchase/receive")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new purchase receive", async () => {
      await request(app)
        .post("/api/purchase/receive")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });
  });

  describe("[Purchase Receive List] [GET] /api/purchase/receive", () => {
    it("Should return 200 and Receive list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/purchase/receive")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
    });
  });

  describe("[Purchase Receive By Id] [GET] /api/purchase/receive/{id}", () => {
    it("Should return 400 because invalid purchase request id", async () => {
      await request(app)
        .get("/api/purchase/receive/{invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Purchase Receive object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/purchase/receive/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Purchase Receive] [PUT] /api/purchase/receive/{id}", () => {
    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/purchase/receive/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/purchase/receive/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");

      expect({
        // items: body.data.items,
        purchaseOrderId: body.data.purchaseOrderId,
        otherCharges: body.data.otherCharges,
        itemsTotal: body.data.itemsTotal,
        taxInvoiceNumber: body.data.taxInvoiceNumber,
        taxInvoiceDate: body.data.taxInvoiceDate,
        taxTotal: body.data.taxTotal,
        taxGst: body.data.taxGst,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Change Purchase Receive Status] [PUT] /api/purchase/receive/{id}/status", () => {
    it("Should return 400 because of invalid purchase receive id", async () => {
      await request(app)
        .put("/api/purchase/receive/invalidId/status")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });
  });
  describe("[Change Purchase Receive Action] [PUT] /api/purchase/receive/{id}/action", () => {
    it("Should return 400 because of invalid purchase receive id", async () => {
      await request(app)
        .put("/api/purchase/receive/invalidId/action")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/purchase/receive/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });
  });

  describe("[Delete Purchase Receive] [DELETE] /api/purchase/receive/{id}", () => {
    it("Should return 400 because of invalid purchase receive id", async () => {
      await request(app)
        .get(`/api/purchase/receive/invalidId`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/purchase/receive/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because the record is deleted", async () => {
      await request(app)
        .get(`/api/purchase/receive/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });
  });
};

function updatedRecords() {
  const tempData = {
    ...data[0],
  };

  tempData.itemsTotal = "itemsTotal";
  return tempData;
}
