const request = require("supertest");
const Logger = require("../../../helpers/Logger.helper");
const app = require("../../../helpers/ExpressApp.helper")();

const data = [
  {
    name: "surbhi yadav",
    email: "surbhi@inevitableinfotech.com",
    contact: "98736543201",
    gstNumber: "22AAAAA0000A1Z4",
    panNumber: "AXNPY2298L",
    currency: "eur",
    website: "iNVEVITABLE INFOTECH    ",
    billing: {
      address: "hazratganj",
      city: "Lucknow",
      state: "Uttar pradesh",
      stateCode: "2260",
      country: "India",
      pinCode: "226601",
    },
    shipping: {
      address: "hazratganj",
      city: "Lucknow",
      state: "Uttar pradesh",
      stateCode: "2260",
      country: "India",
      pinCode: "226601",
    },
    personName: "Shrutii yadav",
    personEmail: "shruti7633@inevitableinfotech.com",
    personContactNumber: "98766543450",
  },
  {
    name: "shweta yadav",
    email: "shweta@inevitableinfotech.com",
    contact: "98736543201",
    gstNumber: "22AAAAA0000A1Z5",
    panNumber: "AXNPY22298L",
    currency: "eur",
    website: "iNVEVITABLE INFOTECH    ",
    billing: {
      address: "hazratganj",
      city: "Lucknow",
      state: "Uttar pradesh",
      stateCode: "2260",
      country: "India",
      pinCode: "226601",
    },
    shipping: {
      address: "hazratganj",
      city: "Lucknow",
      state: "Uttar pradesh",
      stateCode: "2260",
      country: "India",
      pinCode: "226601",
    },
    personName: "Shrutii yadav",
    personEmail: "shruti7633@inevitableinfotech.com",
    personContactNumber: "98766543450",
  },
];

let defaultData = null;

module.exports = () => {
  describe("[Create Vendor] [POST] /api/purchase/vendor", () => {
    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/purchase/vendor")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and create a new vendor", async () => {
      await request(app)
        .post("/api/purchase/vendor")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(200);
    });

    it("Should return 400 because of duplicate vendor name that already exist in database", async () => {
      await request(app)
        .post("/api/purchase/vendor")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[0])
        .expect(400);

      await request(app)
        .post("/api/purchase/vendor")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(data[1]);
    });
  });

  describe("[Vendor List] [GET] /api/purchase/vendor", () => {
    it("Should return 200 and Vendor list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/purchase/vendor")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // save data for later use
      defaultData = body.data[0];
      localStorage.setItem("vendor", body.data[0].id);
    });
  });

  describe("[Vendor By Id] [GET] /api/purchase/vendor/{id}", () => {
    it("Should return 400 because invalid vendor id", async () => {
      await request(app)
        .get("/api/purchase/vendor/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and Vendor object", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/purchase/vendor/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      // expect(body.data).toEqual(defaultData);
    });
  });

  describe("[Update Vendor] [PUT] /api/purchase/vendor/{id}", () => {
    it("Should return 400 because of invalid vendor id", async () => {
      await request(app)
        .put("/api/purchase/vendor/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords())
        .expect(400);
    });

    it("Should return 200 and update vendor records", async () => {
      const { body, statusCode } = await request(app)
        .put(`/api/purchase/vendor/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(updatedRecords());
      // .expect(200);
      console.log(body, "body");
      console.log(updatedRecords, "updatedRecords");
      Logger.debug("updatedRecords", updatedRecords);

      expect(statusCode).toBe(200);
    });

    it("Should return 200 and updated records", async () => {
      const { body } = await request(app)
        .get(`/api/purchase/vendor/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);

      expect(body).toHaveProperty("data");
      expect({
        name: body.data.name,
        email: body.data.email,
        contact: body.data.contact,
        gstNumber: body.data.gstNumber,
        panNumber: body.data.panNumber,
        currency: body.data.currency,
        website: body.data.website,
        billing: body.data.billing,
        shipping: body.data.shipping,
        personName: body.data.personName,
        personEmail: body.data.personEmail,
        personContactNumber: body.data.personContactNumber,
      }).toEqual(updatedRecords());
    });
  });

  describe("[Delete Vendor] [DELETE] /api/purchase/vendor/{id}", () => {
    it("Should return 400 because of invalid vendor id", async () => {
      await request(app)
        .delete("/api/purchase/vendor/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 200 and delete records", async () => {
      await request(app)
        .delete(`/api/purchase/vendor/${defaultData.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(200);
    });

    it("Should return 400 because the vendor record is deleted", async () => {
      await request(app)
        .get(`/api/purchase/vendor/${defaultData.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(400);
    });

    it("Should return 400 and do not update records", async () => {
      await request(app)
        .put(`/api/purchase/vendor/${defaultData.id}`)
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

  tempData.name = "name";
  tempData.email = "email";
  tempData.contact = "contact";
  tempData.gstNumber = "gstNumber";
  tempData.panNumber = "panNumber";
  tempData.currency = "currency";
  tempData.website = "website";
  tempData.billing = {
     _id: '65f3e72904ddc91e956b1c60',
    address: "address",
    city: "city",
    state: "state",
    stateCode: "stateCode",
    country: "country",
    pinCode: "pinCode",
  };
  tempData.shipping = {
    _id: '65f3e72904ddc91e956b1c5f',
    address: "address",
    city: "city",
    state: "state",
    stateCode: "stateCode",
    country: "country",
    pinCode: "pinCode",
  };
  tempData.personName = "personName";
  tempData.personEmail = "personEmail";
  tempData.personContactNumber = "personContactNumber";

  return tempData;
}
