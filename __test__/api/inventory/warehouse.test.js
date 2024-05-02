const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    name: "Public Warehouse",
    address: "Hazratganj",
    state: "active",
    gstNumber: "GST001",
    country: "India",
    pincode: "224001",
    status: "active",
    contact: "+91 89089 08908",
    city: "Lucknow",
  },
  {
    name: "Public Warehouse",
    address: "Hazratganj",
    state: "active",
    gstNumber: "GST002",
    country: "India",
    pincode: "224001",
    status: "active",
    contact: "+91 89089 08908",
    city: "Lucknow",
  },
];

let defaultData = null;

module.exports = () => {
  describe("[Create Warehouse] [POST] /api/inventory/warehouse", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/inventory/warehouse")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new warehouse", async () => {
      await request(app)
        .post("/api/inventory/warehouse")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

    it("Should return 400 because of duplicate warehouse name that already exist in database", async () => {
      await request(app)
        .post("/api/inventory/warehouse")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(400);

      await request(app)
        .post("/api/inventory/warehouse")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[1]);
    });
  });

  describe("[Warehouse List] [GET] /api/inventory/warehouse", () => {
    it("Should return 200 and warehouse list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/inventory/warehouse")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
      localStorage.setItem("warehouseId", body.data[0].id);
    });
  });

  describe("[Warehouse By Id] [GET] /api/inventory/warehouse/{id}", () => {
    it("Should return 400 because invalid warehouse id", async () => {
      await request(app)
        .get("/api/inventory/warehouse/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Warehouse object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/inventory/warehouse/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Warehouse] [PUT] /api/inventory/warehouse/{id}", () => {
    it("Should return 400 because of invalid warehouse id", async () => {
      await request(app)
        .put("/api/inventory/warehouse/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/inventory/warehouse/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/inventory/warehouse/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");

      expect({
        name: body.data.name,
        status: body.data.status,
        country: body.data.country,
        gstNumber: body.data.gstNumber,
        city: body.data.city,
        pincode: body.data.pincode,
        state: body.data.state,
        address: body.data.address,
        contact: body.data.contact,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Delete Warehouse] [DELETE] /api/inventory/warehouse/{id}", () => {
    it("Should return 400 because of invalid warehouse id", async () => {
      await request(app)
        .delete("/api/inventory/warehouse/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/inventory/warehouse/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because the record is deleted", async () => {
      await request(app)
        .get(`/api/inventory/warehouse/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .put(`/api/inventory/warehouse/${defaultData.id}`)
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

  tempData.name = "Updated warehouse";
  tempData.status = "inactive";
  tempData.gstNumber = "GST Number";
  return tempData;
}
