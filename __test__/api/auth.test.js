const { UserModel, RoleModel } = require("../../models");
const request = require("supertest");
const app = require("../../helpers/ExpressApp.helper")();

module.exports = () => {
  beforeAll(() => {
    RoleModel.create({
      id: "T_R12345",
      name: "t_admin",
      description: "t_admin is test admin to init the process of testing",
      permission: {
        dashboard: {
          dashboard: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
        },
        inventory: {
          item: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          warehouse: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          category: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          subcategory: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          stock: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
        },
        purchase: {
          vendor: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          purchase_request: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          rfq: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          quotation: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          purchase_order: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          invoice: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          purchase_receive: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
        },
        sales: {
          customer: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          products: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          orders: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          // transaction: {
          //   read: true,
          //   create: true,
          //   update: true,
          //   delete: true,
          // },
        },
        users_and_roles: {
          users: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          roles: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
        },
        settings: {
          tax: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          currency: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          email: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          policies: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          notification: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          client: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          project: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },

          terms_And_Conditions: {
            read: true,
            create: true,
            update: true,
            delete: true,
          },
        },
      },
      status: "active",
      createdOn: Date.now(),
      updatedOn: Date.now(),
      createdBy: "test",
      updatedBy: "test",
    });
    UserModel.create({
      id: "T_U1010101",
      name: "Test Admin",
      email: "admin.test@ims.com",
      phoneNumber: "+91 89089 08908",
      password: "$2y$10$/NIxf83ncpPSGifl2IB9x.NrhY8udLIU.xzbPsJyJA4ZW1MiW/6Im",
      status: "active",
      address: "Hagratganj",
      city: "Lucknow",
      country: "India",
      isVerified: true,
      pincode: "206001",
      role: "Admin",
      roleId: "T_R12345",
      state: "Uttar Pradesh",
      createdOn: Date.now(),
      updatedOn: Date.now(),
      createdBy: "test",
      updatedBy: "test",
    });
  });

  describe("POST /api/auth/admin/login", () => {
    it("should return 400 Bad Request for missing credentials", async () => {
      await request(app).post("/api/auth/admin/login").send({}).expect(400);
    });

    it("should return 400 Unauthorized for invalid credentials", async () => {
      await request(app)
        .post("/api/auth/admin/login")
        .send({
          email: "invalidUser",
          password: "invalidPassword",
        })
        .expect(400);
    });

    it("should return 400 Bad Request for invalid input format", async () => {
      await request(app)
        .post("/api/auth/admin/login")
        .send({
          user: "invalidUserFormat",
          pass: "invalidPasswordFormat",
        })
        .expect(400);
    });

    it("should return a valid JWT token on successful login", async () => {
      const response = await request(app)
        .post("/api/auth/admin/login")
        .set("Content-Type", "application/json")
        .send({
          email: "admin.test@ims.com",
          password: "Admin@123",
        });

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("permissions");
      localStorage.setItem("authToken", response.body.data.token);
    });
  });
};
