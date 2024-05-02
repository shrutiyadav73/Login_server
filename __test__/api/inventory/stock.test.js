const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [];
  
let defaultData = null;

module.exports = () => {
  beforeAll(() => {
    data.push({
      warehouse: "Warehouse a Updated",
      ipn: "IPN20230710001",
      stock: "1121",
      status: "active",
      assignStock: "12",
      deleted: false,
      currentStock: "20",
      balanceStock: "21",
      project: "",
      client: "",
      warehouseId: localStorage.getItem("warehouseId"),
    });
  });

  describe("[Create Stock] [POST] /api/inventory/stock", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/inventory/stock")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new stock", async () => {
      await request(app)
        .post("/api/inventory/stock")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)

        .send(data[0])
        .expect(200);
    });
  });

  describe("[Stock List] [GET] /api/inventory/stock", () => {
    it("Should return 200 and Stock list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/inventory/stock")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      // defaultData = body.data[0];
    });
  });

  describe("[Stock List History] [GET] /api/inventory/stock/{ipn}/{warehouseId}", () => {
    it("Should return 200 and Stock list history", async () => {
      const ipn = "IPN20230710001";
      const warehouseId = localStorage.getItem("warehouseId");
      const { statusCode, body } = await request(app)
        .get(`/api/inventory/stock/${ipn}/${warehouseId}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe("[Assign Stock] [POST] /api/inventory/stock/assign", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/inventory/stock/assign")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and assign a new stock", async () => {
      await request(app)
        .post("/api/inventory/stock/assign")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

    it("Should return 400 because of assigned stock is greater than current stock that already exist in database", async () => {
      const currentStock = 5;
      const assignStock = 10;
      const res = {};
      await request(app)
        .post("/api/inventory/stock/assign")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send({ currentStock, StockForm: { assignStock } })
        .expect(400)
    });
  });
};

function updatedRecords() {
  const tempData = {
    ...data[0],
  };

  tempData.ipn = "Updated stock";
  tempData.stock = "stock";
  return tempData;
}
