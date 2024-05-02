const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const taxSlabList = [
  {
    name: "GST",
    rate: "2",
    status: "active",
  },
  {
    name: "GST Product",
    rate: "20",
    status: "active",
  },
];

let defaultData = null;

module.exports = () => {
  describe("[Update Tax Configuration] [PUT] /api/settings/tax", () => {
    it("Should return 200 and change tax configuration", async () => {
      await request(app)
        .put(`/api/settings/tax`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send({
          gstNumber: "GST00123",
          legalName: "Bussiness",
          tradeName: "Inevitable inotech",
          registeredDate: "28/1/2024",
          gst: "yes",
        }).expect(200)
    });

    it("Verify Updated Tax Configuration", async () => {
      const { statusCode, body } = await request(app)
      .get("/api/settings/tax")
      .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(typeof body.data).toBe("object");

      const resData = body.data;

      const testBody= {
        gstNumber: resData.gstNumber,
        legalName: resData.legalName,
        tradeName: resData.tradeName,
        registeredDate: resData.registeredDate,
        gstEnabled: resData.gstEnabled,
      };

    

      expect(resData).toMatchObject({
        gstNumber: "GST00123",
        legalName: "Bussiness",
        tradeName: "Inevitable inotech",
        registeredDate: "28/1/2024",
        gstEnabled: true,
      });
    });
  });

  describe("[Create Tax Slab] [POST] /api/settings/tax/slab", () => {

    it("Should return 200 and create tax slab", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/settings/tax")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(taxSlabList[0]).expect(200)

      expect(statusCode).toBe(200);
    });

  });

  // describe("[ List] [GET] /api/settings/tax", () => {
  //   it("Should return 200 and Tax", async () => {
  //     const { statusCode, body } = await request(app)
  //       .get("/api/settings/tax")
  //       .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

  //     expect(statusCode).toBe(200);
  //     expect(body).toHaveProperty("data");
  //     expect(body.data.length).toBeGreaterThan(0);

  //     // save data for later use
  //     defaultData = body.data[0];
  //   });
  // });

  // describe("[Update Tax Slab] [PUT] /api/settings/tax/slab/{id}", () => {
  //   it("Should return 400 because of invalid gst id", async () => {
  //     await request(app)
  //       .put("/api/settings/tax/slab/invalidId")
  //       .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
  //       .send(updatedRecords())
  //       .expect(400);
  //   });

  //   it("Should return 200 and update records", async () => {
  //     await request(app)
  //       .put(`/api/settings/tax/slab/${defaultData.id}`)
  //       .set("Content-Type", "application/json")
  //       .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
  //       .send(updatedRecords())
  //       .expect(200);
  //   });
  // });

  // describe("[Delete Tax] [DELETE] /api/settings/tax/slab/{id}", () => {
  //   it("Should return 400 because of invalid tax id", async () => {
  //     await request(app)
  //       .delete("/api/settings/tax/slab/invalidId")
  //       .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
  //       .expect(400);
  //   });

  //   it("Should return 200 and delete records", async () => {
  //     await request(app)
  //       .delete(`/api/settings/tax/slab/${defaultData.id}`)
  //       .set("Content-Type", "application/json")
  //       .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
  //       .expect(200);
  //   });

  //   it("Should return 400 because the record is deleted", async () => {
  //     await request(app)
  //       .get(`/api/settings/tax/slab/${defaultData.id}`)
  //       .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
  //       .expect(400);
  //   });

  //   it("Should return 400 and do not update records", async () => {
  //     await request(app)
  //       .put(`/api/settings/tax/slab/${defaultData.id}`)
  //       .set("Content-Type", "application/json")
  //       .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
  //       .send(updatedRecords())
  //       .expect(400);
  //   });
  // });
};

function updatedRecords() {
  const tempData = {
    ...taxSlabList[0],
  };

  tempData.name = "Updated Tax";
  tempData.rate = "Rate";
  tempData.status = "Status";
  return tempData;
}
