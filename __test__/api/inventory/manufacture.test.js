const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    name: "seimens",
  },
  {
    name: "Texas Instruments",
  },
];

let defaultData = null;

module.exports = () => {
    describe("[Create Manufacture] [POST] /api/inventory/manufacture", () => {
      it("Should return 400 because of missing request data", async () => {
        await request(app)
            .post("/api/inventory/manufacture")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
});
  
      it("Should return 200 and create a new manufacture", async () => {
          await request(app)
            .post("/api/inventory/manufacture")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[0])
            .expect(200);
});
        
      it("Should return 400 because of duplicate manufacture name that already exist in database", async () => {
          await request(app)
            .post("/api/inventory/manufacture")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[0])
            .expect(400);
    
          await request(app)
            .post("/api/inventory/manufacture")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[1]);
        });
    })
    describe("[Manufacture List] [GET] /api/inventory/manufacture", () => {
      it("Should return 200 and Manufacture list", async () => {
          const { statusCode, body } = await request(app)
            .get("/api/inventory/manufacture")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);
        
            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("data");
            expect(body.data.length).toBeGreaterThan(0);
        
              // save data for later use
            defaultData = body.data[0];
        });
    });

    describe("[Manufacture By Id] [GET] /api/inventory/manufacture/{id}", () => {
      it("Should return 400 because invalid manufacture id", async () => {
          await request(app)
            .get("/api/inventory/manufacture/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
        });
        
      it("Should return 200 and Manufacture object", async () => {
          const { statusCode, body } = await request(app)
            .get(`/api/inventory/manufacture/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);
        
              expect(statusCode).toBe(200);
              expect(body).toHaveProperty("data");
              expect(body.data).toEqual(defaultData);
            });
          });
    
    describe("[Update Manufacture] [PUT] /api/inventory/manufacture/{id}", () => {
      it("Should return 400 because of invalid manufacture id", async () => {
          await request(app)
            .put("/api/inventory/manufacture/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(updatedRecords())
            .expect(400);
                });
            
      it("Should return 200 and update records", async () => {
          await request(app)
            .put(`/api/inventory/manufacture/${defaultData.id}`)
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(updatedRecords())
            .expect(200);
                });
            
      it("Should return 200 and updated records", async () => {
          const { body } = await request(app)
            .get(`/api/inventory/manufacture/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(200);
            
          expect(body).toHaveProperty("data");

          expect({
            name: body.data.name,
              }).toEqual(updatedRecords());
            });
          });
    describe("[Delete Manufacture] [DELETE] /api/inventory/manufacture/{id}", () => {
      it("Should return 400 because of invalid manufacture id", async () => {
          await request(app)
            .delete("/api/inventory/manufacture/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
            });
        
      it("Should return 200 and delete records", async () => {
          await request(app)
            .delete(`/api/inventory/manufacture/${defaultData.id}`)
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(200);
            });
        
      it("Should return 400 because the record is deleted", async () => {
          await request(app)
            .get(`/api/inventory/manufacture/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
            });
        
      it("Should return 400 and do not update records", async () => {
          await request(app)
            .put(`/api/inventory/manufacture/${defaultData.id}`)
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
    return tempData;
          }