const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    
    host: "host@12345",
    port: "4000",
    email :"Shruti@401Infotech.com",
    password:"s12334",
    status: "active",
  },
  
];

let defaultData = null;

module.exports = () => {
    describe("[Create Email] [POST] /api/settings/email", () => {
      it("Should return 400 because of missing request data", async () => {
        await request(app)
            .post("/api/settings/email")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
});
  
      it("Should return 200 and create a new email", async () => {
          await request(app)
            .post("/api/settings/email")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[0])
            .expect(200);
});
        
      it("Should return 400 because of duplicate email name that already exist in database", async () => {
          await request(app)
            .post("/api/settings/email")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[0])
            .expect(400);
    
          await request(app)
            .post("/api/settings/email")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[1]);
        });
    })
    describe("[Email List] [GET] /api/settings/email", () => {
      it("Should return 200 and Email list", async () => {
          const { statusCode, body } = await request(app)
            .get("/api/settings/email")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);
        
            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("data");
            expect(body.data.length).toBeGreaterThan(0);
        
              // save data for later use
            defaultData = body.data[0];
        });
    });

    describe("[Email By Id] [GET] /api/settings/email/{id}", () => {
      it("Should return 400 because invalid email id", async () => {
          await request(app)
            .get("/api/settings/email/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
        });
        
      it("Should return 200 and Email object", async () => {
          const { statusCode, body } = await request(app)
            .get(`/api/settings/email/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);
        
              expect(statusCode).toBe(200);
              expect(body).toHaveProperty("data");
              expect(body.data).toEqual(defaultData);
            });
          });
    
    describe("[Update Email] [PUT] /api/settings/email/{id}", () => {
      it("Should return 400 because of invalid email id", async () => {
          await request(app)
            .put("/api/settings/email/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(updatedRecords())
            .expect(400);
                });
            
      it("Should return 200 and update records", async () => {
          await request(app)
            .put(`/api/settings/email/${defaultData.id}`)
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(updatedRecords())
            .expect(200);
                });
            
      it("Should return 200 and updated records", async () => {
          const { body } = await request(app)
            .get(`/api/settings/email/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(200);
            
            expect(body).toHaveProperty("data");
            expect({
                
                host: body.data.host,
                port: body.data.port,
                password:body.data.password,
                status: body.data.status,
                email: body.data.email,
               
              }).toEqual(updatedRecords());
            });
          });

    describe("[Delete Email] [DELETE] /api/settings/email/{id}", () => {
      it("Should return 400 because of invalid email id", async () => {
          await request(app)
            .delete("/api/settings/email/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
            });
        
      it("Should return 200 and delete records", async () => {
          await request(app)
            .delete(`/api/settings/email/${defaultData.id}`)
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(200);
            });
        
      it("Should return 400 because the record is deleted", async () => {
          await request(app)
            .get(`/api/settings/email/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
            });
        
      it("Should return 400 and do not update records", async () => {
          await request(app)
            .put(`/api/settings/email/${defaultData.id}`)
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
          
    tempData.email = "Updated email";
    tempData.status = "inactive";
    return tempData;
          }