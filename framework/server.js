const express = require("express");
const path = require("path");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const dotenv = require("dotenv").config();

console.log("Hello Back End");

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

//const mongoClient = new MongoClient(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const PORT = process.env.PORT || 80;

const BASIC_OK = { status: "ok" };
const BASIC_KO = { status: "ko" };

const app = express();
app.disable("x-powered-by");
app.use( express.json() );

// other middlewares
app.use(responseMiddleware);
app.use( '/', express.static( path.join( __dirname, "static" )) );
app.use(tempRequestHandler); // 404 for example

function responseMiddleware( req, res, next)
{
    res.removeHeader("x-powered-by");

    res.append("x-content-type-options", "nosniff");
    res.append("cache-control", "no-cache");
    next();
};

// temp middleware
function tempRequestHandler(req, res, next)
{
    // make redirection here - default 302 so not write
    res.redirect("/");
};

app.listen(PORT);
