console.log("Test");

const express = require("express");
const bodyParser = require('body-parser');

// Require the dotenv
require('dotenv').config()
console.log(process.env.BASE_URI);

// Import mongoose
const mongoose = require("mongoose");

// Setup mongoose connection
const mongoDB = "mongodb://127.0.0.1/films";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get default connection for mongoose
const db = mongoose.connection;

// Connection errors binding
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Create webserv
const app = express();

const filmsRouter = require('./routers/filmsRouter')

// Bodyparser middleware for urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// Parse the json data
app.use(bodyParser.json({type: 'application/json'}));


app.use("/films/", filmsRouter);

app.listen(8000);