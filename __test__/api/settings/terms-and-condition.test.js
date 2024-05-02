const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    scope: [{ 1: 'true' }],
    name: "New T&C",
    description :"Added T&C",
  },
  {
    scope: [{ 2: 'false' }],
    name: "T&C 1",
    description :"List of  T&C",
  },
  
];

let defaultData = null;

module.exports = () => {
    describe("[Create TermsAndCondition] [POST] /api/settings/terms-and-condition", () => {
      it("Should return 400 because of missing request data", async () => {
        await request(app)
            .post("/api/settings/terms-and-condition")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
});
  
      it("Should return 200 and create a new TermsAndCondition", async () => {
          await request(app)
            .post("/api/settings/terms-and-condition")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[0])
            .expect(200);
});
        
      it("Should return 400 because of duplicate TermsAndCondition that already exist in database", async () => {
          await request(app)
            .post("/api/settings/terms-and-condition")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[0])
            .expect(400);
    
          await request(app)
            .post("/api/settings/terms-and-condition")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(data[1]);
        });
    })

    describe("[TermsAndCondition List] [GET] /api/settings/terms-and-condition", () => {
      it("Should return 200 and TermsAndCondition list", async () => {
          const { statusCode, body } = await request(app)
            .get("/api/settings/terms-and-condition")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);
        
            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("data");
            expect(body.data.length).toBeGreaterThan(0);
        
              // save data for later use
            defaultData = body.data[0];
        });
    });

    describe("[TermsAndCondition By Id] [GET] /api/settings/terms-and-condition/{id}", () => {
      it("Should return 400 because of invalid TermsAndCondition id", async () => {
          await request(app)
            .get("/api/settings/terms-and-condition/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
        });
        
      it("Should return 200 and TermsAndCondition object", async () => {
          const { statusCode, body } = await request(app)
            .get(`/api/settings/terms-and-condition/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);
        
              expect(statusCode).toBe(200);
              expect(body).toHaveProperty("data");
              expect(body.data).toEqual(defaultData);
            });
          });
    
    describe("[Update TermsAndCondition] [PUT] /api/settings/terms-and-condition/{id}", () => {
      it("Should return 400 because of invalid TermsAndCondition id", async () => {
          await request(app)
            .put("/api/settings/terms-and-condition/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(updatedRecords())
            .expect(400);
                });
            
      it("Should return 200 and update records", async () => {
          await request(app)
            .put(`/api/settings/terms-and-condition/${defaultData.id}`)
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .send(updatedRecords())
            .expect(200);
                });
            
      it("Should return 200 and updated records", async () => {
          const { body } = await request(app)
            .get(`/api/settings/terms-and-condition/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(200);
            
            expect(body).toHaveProperty("data");
            expect({
                
                name: body.data.name,
                description: body.data.description,
                scope:body.data.scope,
               
              }).toEqual(updatedRecords());
            });
          });

    describe("[Delete TermsAndCondition] [DELETE] /api/settings/terms-and-condition/{id}", () => {
      it("Should return 400 because of invalid TermsAndCondition id", async () => {
          await request(app)
            .delete("/api/settings/terms-and-condition/invalidId")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
            });
        
      it("Should return 200 and delete records", async () => {
          await request(app)
            .delete(`/api/settings/terms-and-condition/${defaultData.id}`)
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(200);
            });
        
      it("Should return 400 because the record is deleted", async () => {
          await request(app)
            .get(`/api/settings/terms-and-condition/${defaultData.id}`)
            .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
            .expect(400);
            });
        
      it("Should return 400 and do not update records", async () => {
          await request(app)
            .put(`/api/settings/terms-and-condition/${defaultData.id}`)
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
          
    tempData.name = "Updated Name";
    tempData.description = "Updated Description";
    return tempData;
          }