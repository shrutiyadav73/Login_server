const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const { getAppVersion, getAppUrl } = require("../constant/App.constant");
const { getSwaggerSchemas } = require("../constant/Swagger.constant");
const swaggerSchemas = getSwaggerSchemas();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "InviIMS API",
      version: getAppVersion(),
      description: "InviIMS apis documentation",
    },
    basePath: "/",
    components: {
      schemas: swaggerSchemas,
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: getAppUrl(),
      },
    ],
  },
  apis: ["**/*.router.js"],
};

const specs = swaggerJsDoc(options);

function initSwagger(app) {
  app.use(
    "/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(specs, {
      // explorer: true,
      customSiteTitle: "InviIMS APIs Document",
      swaggerOptions: {
        validatorUrl: null,
      },
    })
  );
}

module.exports = initSwagger;
