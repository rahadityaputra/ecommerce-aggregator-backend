const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce Aggregator API',
      version: '1.0.0',
      description: 'Production-ready boilerplate API documentation'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product management endpoints' },
      { name: 'Orders', description: 'Order management endpoints' },
      { name: 'Mappings', description: 'SKU mapping endpoints' },
      { name: 'Marketplaces', description: 'Marketplace configuration endpoints' },
      { name: 'Sync', description: 'Sync endpoints' },
      { name: 'Sync Logs', description: 'Sync logs endpoints' },
      { name: 'Payload Logs', description: 'Payload logs endpoints' },
      { name: 'Analytics', description: 'Analytics and metrics endpoints' },
      { name: 'Webhooks', description: 'Webhooks for marketplace events' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js', './src/modules/**/*.js']
};

const specs = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;
