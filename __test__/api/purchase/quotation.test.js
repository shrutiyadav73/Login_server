const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    // status: "active",
    rfqId: localStorage.getItem("rfqId"),
    venderQuotationId: "QUO000023",
    quotationDate: "2023-07-27T12:24:44.915+00:00",
    quotationValidity: "210 days",
    quotationCurrency: "Rupees",
    // quotationFiles: [],
    // items: [
    //   {
    //     ipn: "IPN202307100022",
    //     itemType: "original",

    //     requestedQty: "200",
    //     quotedQuantity: "56",
    //     partNo: "MPN0002223",
    //     minimumQuantity: "80",
    //     quotedLeadTime: "800 days",
    //     quotedUnitPrice: "700099",
    //   },
    // ],
    paymentTerm: "fullPaymenttermsandterms",
    // paymentTermsEvents: [
    //   {
    //     event: "partial",
    //     amount: "9000",
    //   },
    // ],
  },
];

let defaultData = null;

module.exports = () => {
  describe("[Create Quotation] [POST] /api/purchase/quotation", () => {
    it("Should return 400 because of missing requested data", async () => {
      await request(app)
        .post("/api/purchase/quotation")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new quotation", async () => {
      await request(app)
        .post("/api/purchase/quotation")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });
  });
  describe("[Quotation List] [GET] /api/purchase/quotation", () => {
    it("Should return 200 and Quotation list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/purchase/quotation")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
      localStorage.setItem("quotationId", body.data[0].id);
    });
  });

  describe("[Quotation By Id] [GET] /api/purchase/quotation/{id}", () => {
    it("Should return 400 because invalid quotation id", async () => {
      await request(app)
        .get("/api/purchase/quotation/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Quotation object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/purchase/quotation/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });
  });

  describe("[Update Quotation] [PUT] /api/purchase/quotation/{id}", () => {
    it("Should return 400 because of invalid quotation id", async () => {
      await request(app)
        .put("/api/purchase/quotation/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/purchase/quotation/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/purchase/quotation/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");
      expect({
        rfqId: body.data.rfqId,
        status: body.data.status,
        venderQuotationId: body.data.venderQuotationId,
        quotationDate: body.data.quotationDate,
        quotationCurrency: body.data.quotationCurrency,
        quotationValidity: body.data.quotationValidity,
        // items: body.data.items,
        // quotationFiles: body.data.quotationFiles,
        paymentTerm: body.data.paymentTerm,
        // paymentTermsEvents: body.data.paymentTermsEvents,
      }).toEqual(updatedRecords());
    });
  });
  describe("[Delete Quotation] [DELETE] /api/purchase/quotation/{id}", () => {
    it("Should return 400 because of invalid quotation id", async () => {
      await request(app)
        .get(`/api/purchase/quotation/invalidId`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/purchase/quotation/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because the record is deleted", async () => {
      await request(app)
        .get(`/api/purchase/quotation/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .get(`/api/purchase/quotation/${defaultData.id}`)
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

  tempData.rfqId = "Updated RfqId";
  tempData.status = "inactive";
  return tempData;
}
