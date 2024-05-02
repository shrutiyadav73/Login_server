const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    categoryId: "C81537",
    name: "CAPACITOR 22,0 UF",
    status: "active",
  },
  {
    categoryId: "C81537 ",
    name: "EEE-FK1E100R",
    status: "active",
  },
];

let defaultData = null;

module.exports = () => {
  describe("[Create Subcategory] [POST] /api/inventory/subcategory", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/inventory/subcategory")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new Subcategory", async () => {
      await request(app)
        .post("/api/inventory/subcategory")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

    it("Should return 400 because of duplicate entries", async () => {
      await request(app)
        .post("/api/inventory/subcategory")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(400);

      await request(app)
        .post("/api/inventory/subcategory")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[1]);
    });
  });

  describe("[Subcategory List] [GET] /api/inventory/subcategory", () => {
    it("Should return 200 and Subcategory list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/inventory/subcategory")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
    });
  });

  describe("[Subcategory By Id] [GET] /api/inventory/subcategory/{id}", () => {
    it("Should return 400 because invalid Subcategory id", async () => {
      await request(app)
        .get("/api/inventory/subcategory/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Subcategory object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/inventory/subcategory/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      // expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Subcategory] [PUT] /api/inventory/subcategory/{id}", () => {
    it("Should return 400 because invalid Subcategory id", async () => {
      await request(app)
        .put("/api/inventory/subcategory/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/inventory/subcategory/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/inventory/subcategory/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");

      expect({
        name: body.data.name,
        categoryId:body.data.categoryId,
        status: body.data.status,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Delete Subcategory] [DELETE] /api/inventory/subcategory/{id}", () => {
    it("Should return 400 because invalid Subcategory id", async () => {
      const data = await request(app)
        .delete("/api/inventory/subcategory/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/inventory/subcategory/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because record deleted", async () => {
      await request(app)
        .get(`/api/inventory/subcategory/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .put(`/api/inventory/subcategory/${defaultData.id}`)
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

  tempData.name = "Updated Subcategory";
  tempData.status = "inactive";
  return tempData;
}
