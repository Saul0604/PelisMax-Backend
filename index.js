require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./src/config/db');
connectDB();


app.use(express.json());

app.listen(port, () => {
    console.log("Todo jalando al 100 me parece ")
});

