const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    name: "policy1",
    status: "active",
    description: "policy description",
    effectiveDate: "Fri May 12 2023 00:00:00 GMT+0530",
  },
  {
    name: "Leave Policy",
    description: "product policy descsription update",
    status: "active",
    effectiveDate: "Thu May 11 2023 00:00:00 GMT+0530",
  },
];

let defaultData = null;

module.exports = () => {
    describe("[Create Policy] [POST] /api/settings/policy", () => {
      it("Should return 400 because of missing request data", async () => {
        await request(app)
            .post("/api/settings/policy")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
});
  
      it("Should return 200 and create a new policy", async () => {
          await request(app)
            .post("/api/settings/policy")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[0])
            .expect(200);
});
        
      it("Should return 400 because of duplicate policy name that already exist in database", async () => {
          await request(app)
            .post("/api/settings/policy")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[0])
            .expect(400);
    
          await request(app)
            .post("/api/settings/policy")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[1]);
        });
    })
    describe("[Policy List] [GET] /api/settings/policy", () => {
      it("Should return 200 and Policy list", async () => {
          const { statusCode, body } = await request(app)
            .get("/api/settings/policy")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);
        
            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("data");
            expect(body.data.length).toBeGreaterThan(0);
        
              // save data for later use
            defaultData = body.data[0];
        });
    });

    describe("[Policy By Id] [GET] /api/settings/policy/{id}", () => {
      it("Should return 400 because invalid policy id", async () => {
          await request(app)
            .get("/api/settings/policy/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
        });
        
      it("Should return 200 and Policy object", async () => {
          const { statusCode, body } = await request(app)
            .get(`/api/settings/policy/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);
        
              expect(statusCode).toBe(200);
              expect(body).toHaveProperty("data");
              expect(body.data).toEqual(defaultData);
            });
          });
    
    describe("[Update Policy] [PUT] /api/settings/policy/{id}", () => {
      it("Should return 400 because of invalid policy id", async () => {
          await request(app)
            .put("/api/settings/policy/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(updatedRecords())
            .expect(400);
                });
            
      it("Should return 200 and update records", async () => {
          await request(app)
            .put(`/api/settings/policy/${defaultData.id}`)
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(updatedRecords())
            .expect(200);
                });
            
      it("Should return 200 and updated records", async () => {
          const { body } = await request(app)
            .get(`/api/settings/policy/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(200);
            
          expect(body).toHaveProperty("data");

          expect({
            
            name: body.data.name,
            status: body.data.status,
            description: body.data.description,
            effectiveDate: body.data.effectiveDate,
              }).toEqual(updatedRecords());
            });
          });
    describe("[Delete Policy] [DELETE] /api/settings/policy/{id}", () => {
      it("Should return 400 because of invalid policy id", async () => {
          await request(app)
            .delete("/api/settings/policy/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
            });
        
      it("Should return 200 and delete records", async () => {
          await request(app)
            .delete(`/api/settings/policy/${defaultData.id}`)
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(200);
            });
        
      it("Should return 400 because the record is deleted", async () => {
          await request(app)
            .get(`/api/settings/policy/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
            });
        
      it("Should return 400 and do not update records", async () => {
          await request(app)
            .put(`/api/settings/policy/${defaultData.id}`)
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
          
    tempData.name = "Updated policy";
    tempData.status = "inactive";
    return tempData;
          }