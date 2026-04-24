require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./src/config/db');
const routerApi = require('./src/routes/rutas');
const setupSwagger = require('./src/config/swagger');
connectDB();


app.use(express.json());

routerApi(app);
setupSwagger(app);

app.listen(port, () => {
    console.log("Todo jalando al 100 me parece ")
});

