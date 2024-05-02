const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    name: "BIPOLAR CAPACITOR 22,0 UF",
    attribute: [{ name: "Voltage - Rated" }, { name: "Voltage" }],
    status: "active",
  },
  {
    name: "BIPOLAR CAPACITOR",
    attribute: [{ name: "Voltage - Rated" }, { name: "Voltage" }],
    status: "active",
  },
];


let defaultData = null;

module.exports = () => {
  describe("[Create Category] [POST] /api/inventory/category", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/inventory/category")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new category", async () => {
      await request(app)
        .post("/api/inventory/category")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

    it("Should return 400 because of duplicate entries", async () => {
      await request(app)
        .post("/api/inventory/category")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(400);

      await request(app)
        .post("/api/inventory/category")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[1]);
    });
  });

  describe("[Category List] [GET] /api/inventory/category", () => {
    it("Should return 200 and Category list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/inventory/category")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
    });
  });

  describe("[Category By Id] [GET] /api/inventory/category/{id}", () => {
    it("Should return 400 because invalid category id", async () => {
      await request(app)
        .get("/api/inventory/category/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Category object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/inventory/category/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Category] [PUT] /api/inventory/category/{id}", () => {
    it("Should return 400 because invalid category id", async () => {
      await request(app)
        .put("/api/inventory/category/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/inventory/category/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/inventory/category/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");

      expect({
        name: body.data.name,
        status: body.data.status,
        attribute: body.data.attribute,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Delete Category] [DELETE] /api/inventory/category/{id}", () => {
    it("Should return 400 because invalid category id", async () => {
      const data = await request(app)
        .delete("/api/inventory/category/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/inventory/category/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because record deleted", async () => {
      await request(app)
        .get(`/api/inventory/category/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .put(`/api/inventory/category/${defaultData.id}`)
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

  tempData.name = "Updated category";
  tempData.status = "inactive";
  return tempData;
}
