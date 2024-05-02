const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    name: "Amit Mishra",
    email: "amit83@inevitableinfotech.com",
    department: "Development",
    contact: "917858925478",
  },
];

let defaultData = null;

module.exports = () => {
  describe("[Create Indentor] [POST] /api/resources/indentor", () => {
    it("Should return 400 because of missing requested data", async () => {
      await request(app)
        .post("/api/resources/indentor")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new indentor", async () => {
      await request(app)
        .post("/api/resources/indentor")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

    it("Should return 400 because of duplicate indentor name that already exist in database", async () => {
      await request(app)
        .post("/api/resources/indentor")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(400);

      await request(app)
        .post("/api/resources/indentor")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0]);
    });
  });
  describe("[Indentor List] [GET] /api/resources/indentor", () => {
    it("Should return 200 and Indentor list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/resources/indentor")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
    });
  });

  describe("[Indentor By Id] [GET] /api/resources/indentor/{id}", () => {
    it("Should return 400 because invalid indentor id", async () => {
      await request(app)
        .get("/api/resources/indentor/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Indentor object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/resources/indentor/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      // expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Indentor] [PUT] /api/resources/indentor/{id}", () => {
    it("Should return 400 because of invalid indentor id", async () => {
      await request(app)
        .put("/api/resources/indentor/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update records", async () => {
      await request(app)
        .put(`/api/resources/indentor/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/resources/indentor/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");
      expect({
        name: body.data.name,
        email: body.data.email,
        contact: body.data.contact,
        department: body.data.department,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Delete Indentor] [DELETE] /api/resources/indentor/{id}", () => {
    it("Should return 400 because of invalid indentor id", async () => {
      await request(app)
        .delete("/api/resources/indentor/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/resources/indentor/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because the record is deleted", async () => {
      await request(app)
        .get(`/api/resources/indentor/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .put(`/api/resources/indentor/${defaultData.id}`)
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

  tempData.name = "Updated name";
    tempData.email = "email";
    tempData.contact = "contact";
    tempData.department = "department";
    
  return tempData;
}
