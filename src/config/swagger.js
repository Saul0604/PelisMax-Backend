const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PelisMax API',
            version: '1.0.0',
            description: 'Documentación de la API de PelisMax',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desarrollo',
            },
        ],
    },
    // Aquí le decimos dónde están los comentarios JSDoc con las rutas
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('Swagger disponible en http://localhost:3000/api/docs');
}

module.exports = setupSwagger;
