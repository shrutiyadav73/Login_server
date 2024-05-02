const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

let data = null;

let defaultData = null;

module.exports = () => {
  beforeAll(() => {
    data = [
      {
        ipn: "IPN056-BIPOLARCAPACITOR220UF-NDT",
        shortDescription: "CAP ALUM 22UF 10% 63V AXIAL",
        description: "22 µF 63 V Aluminum Electrolytic Capacitors Axial",
        categoryId: "C70728",
        unit: "cm",
        subcategoryId: "SC84162",

        attribute: [
          {
            key: "capacitor",
            value: "5",
          },
        ],

        manufacturer: [
          {
            id: "MFT37207",
            name: "Abracon",
            mpn: "MPN002323",
          },
        ],
        forSale: true,
        forPurchase: false,
        totalAvailableStock: "10",
      },
      {
        ipn: "IPN056-BIPOLARCAPACITOR220UF-NDTd",
        shortDescription: "CAP ALUM 22UF 10% 63V AXIAL",
        description: "22 µF 63 V Aluminum Electrolytic Capacitors Axial",
        categoryId: "C70728",
        unit: "cm",
        subcategoryId: "SC84162",

        attribute: [
          {
            key: "capacitor",
            value: "5",
          },
        ],

        manufacturer: [
          {
            id: "MFT37207",
            name: "Abracon",
            mpn: "MPN002323",
          },
        ],
        forSale: true,
        forPurchase: false,
        totalAvailableStock: "10",
      },
    ];
  });

  describe("[Create Item] [POST] /api/inventory/item", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/inventory/item")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new Item", async () => {
      await request(app)
        .post("/api/inventory/item")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

    it("Should return 400 because of duplicate entries", async () => {
      await request(app)
        .post("/api/inventory/item")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(400);

      await request(app)
        .post("/api/inventory/item")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[1]);
    });
  });

  describe("[Item List] [GET] /api/inventory/item", () => {
    it("Should return 200 and item list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/inventory/item")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
    });
  });

  describe("[Item By Id] [GET] /api/inventory/item/{id}", () => {
    it("Should return 400 because invalid item id", async () => {
      await request(app)
        .get("/api/inventory/item/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Item object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/inventory/item/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      // expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Item] [PUT] /api/inventory/item/{id}", () => {
    it("Should return 400 because invalid item id", async () => {
      await request(app)
        .put("/api/inventory/item/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/inventory/item/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/inventory/item/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");
      expect(body.data).toHaveProperty("manufacturer");

      expect(body.data.manufacturer.length).toBe(2);
    });
  });

  describe("[Delete Item] [DELETE] /api/inventory/item/{id}", () => {
    it("Should return 400 because invalid item id", async () => {
      const data = await request(app)
        .delete("/api/inventory/item/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/inventory/item/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because record deleted", async () => {
      await request(app)
        .get(`/api/inventory/item/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .put(`/api/inventory/item/${defaultData.id}`)
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

  tempData.manufacturer= [
    {
      id: "MFT37207",
      name: "Abracon",
      mpn: "MPN002323",
    },
    {
      id: "MFT37208",
      name: "Abracon1",
      mpn: "MPN0023233",
    },
  ]

  return tempData;
}
