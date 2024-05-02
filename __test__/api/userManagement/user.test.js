const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

module.exports = () => {
  describe("[User List] [GET] /api/user-management/user", () => {
    it("Should return 401 because of missing authorization token", async () => {
      await request(app).get("/api/user-management/user").expect(401);
    });

    it("Should return user's list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/user-management/user")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
    });
  });

  describe("[Create User] [POST] /api/user-management/user", () => {
    it("Should return 401 because of missing authorization token", async () => {
      await request(app).post("/api/user-management/user").expect(401);
    });

    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/user-management/user")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send({})
        .expect(400);
    });
  });
};
