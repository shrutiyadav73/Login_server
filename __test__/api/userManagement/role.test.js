const request = require("supertest");
const app = require("../../../helpers/ExpressApp.helper")();

let defaultRole = null;

module.exports = () => {
  describe("[Create Role] [POST] /api/user-management/role", () => {
    it("Should return 401 because of missing authorization token", async () => {
      await request(app).post("/api/user-management/role").expect(401);
    });

    it("Should return 400 because of missing request data", async () => {
      await request(app)
        .post("/api/user-management/role")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send({})
        .expect(400);
    });

    it("Should return 400 because of incomplete data", async () => {
      await request(app)
        .post("/api/user-management/role")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send({
          description:
            "Administrator has full access of the modules in the application",
          permission: rolePermissions(),
        })
        .expect(400);
    });

    it("Should return 200 and create a new role 'Administrator'", async () => {
      await request(app)
        .post("/api/user-management/role")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send({
          name: "administrator",
          description:
            "Administrator has full access of the modules in the application",
          permission: rolePermissions(),
        })
        .expect(200);
    });

    it("Should return 400 because of duplicate role name 'administrator'", async () => {
      await request(app)
        .post("/api/user-management/role")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send({
          name: "administrator",
          description:
            "Administrator has full access of the modules in the application",
          permission: rolePermissions(false),
        })
        .expect(400);
    });

    it("Should return 200 and create a new role 'Manager'", async () => {
      await request(app)
        .post("/api/user-management/role")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send({
          name: "manager",
          description: "Manager has limited access",
          permission: rolePermissions(false),
        })
        .expect(200);
    });
  });

  describe("[Role List] [GET] /api/user-management/role", () => {
    it("Should return 401 because of missing authorization token", async () => {
      await request(app).get("/api/user-management/role").expect(401);
    });

    it("Should return 200 and Role list", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/user-management/role")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data.length).toBeGreaterThan(0);

      // Save Admin Role for latter user
      defaultRole = body.data[0];
    });
  });

  describe("[Role By Id] [GET] /api/user-management/role", () => {
    it("Should return 401 because of missing authorization token", async () => {
      await request(app)
        .get("/api/user-management/role")
        .expect(401);
    });

    it("Should return 404 because invalid role id", async () => {
      await request(app)
        .get("/api/user-management/role/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(404);
    });

    it("Should return 200 and Role", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/user-management/role/${defaultRole.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body.data).toEqual(defaultRole);

      // Store role id
      localStorage.setItem("roleId", defaultRole.id);
    });
  });

  describe("[Update Role] [POST] /api/user-management/role/{id}", () => {
    it("Should return 401 because of missing authorization token", async () => {
      await request(app).post("/api/user-management/role").expect(401);
    });

    it("Should return 404 because invalid role id", async () => {
      await request(app)
        .post("/api/user-management/role/invalidId")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .expect(404);
    });

    it("Should return 200 and update role name 'Administrator' to 'admin'", async () => {
      const roleData = {
        name: "admin",
        description:
          "Administrator has full access of the modules in the application",
        permission: rolePermissions(),
      };

      roleData.permission.inventory.item.create = false;

      await request(app)
        .put(`/api/user-management/role/${defaultRole.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`)
        .send(roleData)
        .expect(200);
    });

    it("Should return 200 and role name should be change from 'administrator' to 'admin'", async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/user-management/role/${defaultRole.id}`)
        .set("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("data");

      const roleData = {
        name: "admin",
        description:
          "Administrator has full access of the modules in the application",
        permission: rolePermissions(),
      };

      roleData.permission.inventory.item.create = false;

      expect({
        name: body.data.name,
        description: body.data.description,
        permission: body.data.permission,
      }).toEqual(roleData);
    });
  });
};

function rolePermissions(admin = true) {
  if (admin) {
    return {
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
    };
  } else {
    return {
      dashboard: {
        dashboard: {
          read: false,
          create: false,
          update: false,
          delete: false,
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
          read: false,
          create: false,
          update: false,
          delete: false,
        },
        category: {
          read: true,
          create: true,
          update: true,
          delete: true,
        },
        subcategory: {
          read: false,
          create: false,
          update: false,
          delete: false,
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
          read: false,
          create: false,
          update: false,
          delete: false,
        },
        products: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },
        orders: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },
        // transaction: {
        //   read: false,
        //   create: false,
        //   update: false,
        //   delete: false,
        // },
      },
      users_and_roles: {
        users: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },
        roles: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },
      },
      settings: {
        tax: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },
        currency: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },
        email: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },
        policies: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },
        notification: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },
        client: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },
        project: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },

        terms_And_Conditions: {
          read: false,
          create: false,
          update: false,
          delete: false,
        },
      },
    };
  }
}
