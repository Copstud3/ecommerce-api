import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";


const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce api",
      version: "1.0.0",
      description: "API documentation for an Ecommerce application",
    },
    servers: [
        {
            url: "{protocol}://{host}",
            description: "Current server",
            protocol: { default: "https" },
              host: { default: "8dbeab65-bee0-4c28-a005-e78844e02891.us-east-1.cloud.genez.io/" },
          },
          { url: "http://localhost:3000", description: "Local development server" },
    ],
  },
  apis: ["./src/routes/products/*.ts", "./src/routes/auth/*.ts"], // Point to your controller files
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("Swagger docs available at /docs");
  };