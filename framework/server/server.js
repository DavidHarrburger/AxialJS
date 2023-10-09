const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config();

console.log("Hello Back End");

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

const CRYPTO_ALGORITHM = process.env.CRYPTO_ALGORITHM;
const CRYPTO_KEY = process.env.CRYPTO_KEY;
const CRYPTO_IV = process.env.CRYPTO_IV;

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const MONGO_CLIENT = new MongoClient(DATABASE_URL,
{
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

const PORT = process.env.PORT || 80;

const BASIC_OK = { status: "ok" };
const BASIC_KO = { status: "ko" };

const ROLE_ADMIN_PATH = "/admin/";

/// --------------------
/// API
/// --------------------

// POST api.auth.signin
const postAuthSigninHandler = async function( request, response, next )
{
    console.log("postSiginHandler");
    try
    {
        const email = request.body.email;
        const password = request.body.password;

        const client = await MONGO_CLIENT.connect();
        const db = client.db(DATABASE_NAME);
        const users = db.collection("users");
        const user = await users.findOne( { email: email } );
        console.log(user);

        if( user === null )
        {
            response.json( {status: "ko", message: "user not found" } );
        }
        else
        {
            const cypher = crypto.createCipheriv( CRYPTO_ALGORITHM, Buffer.from(CRYPTO_KEY), Buffer.from(CRYPTO_IV) );
            let encrypted = cypher.update(password, "utf-8", "hex");
            encrypted += cypher.final("hex");
            
            if( String(user.password) !== encrypted )
            {
                response.json( {status: "ko", message: "incorrect password" } );
            }
            else
            {
                const payload = 
                {
                    username: user.name,
                    uuid: user.uuid,
                    role: user.role
                }

                const token = jwt.sign( JSON.stringify(payload), JWT_SECRET_KEY );
                console.log(token);

                response.cookie("axial_cookie_jwt", token, { httpOnly: true } );
                response.json( { status: "ok", message: "connected" } );
            }
        }
    }
    catch(err)
    {
        response.json( {status: "ko", error:err.message} );
    }
    finally
    {
        await MONGO_CLIENT.close();
    }
};
// POST api.auth.signup
const postAuthSignupHandler = async function( request, response, next )
{
    console.log("postSignupHandler");
    try
    {
        let isValid = true;

        const username = request.body.username;
        const email = request.body.email;
        const password = request.body.password;

        // first we chzck the strings
        // TODO : add check on white strings
        // TODO : add proper email checker

        if( username === "" )      { isValid = false; }
        if( email === "" )         { isValid = false; }
        if( password === "" )      { isValid = false; }

        if( isValid === false )
        {
            response.json( BASIC_KO );
        }
        else
        {

        }
        response.json( BASIC_OK );

        /*
        const client = await MONGO_CLIENT.connect();
        const db = client.db(DATABASE_NAME);
        const users = db.collection("users");
        const user = await users.findOne( { email: email } );
        console.log(user);

        if( user !== null )
        {
            response.json( {status: "ko", message: "user already exists" } );
        }
        else
        {
            console.log("we can register the user");
            response.json( BASIC_OK );
        }
        */
    }
    catch(err)
    {
        response.json( BASIC_KO );
    }
    finally
    {
        await MONGO_CLIENT.close();
    }

}
// POST api.auth.signout
const postAuthSignoutHandler = async function( request, response, next )
{
    console.log("postSignoutHandler");
    try
    {
        response.clearCookie("axial_cookie_jwt");
        response.json( {status: "ok", message: "disconnected"} );
    }
    catch(err)
    {
        response.json( BASIC_KO );
    }
}


const app = express();
app.disable("x-powered-by");

app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );
app.use( cookieParser() );

// other middlewares
app.use( responseMiddleware );
app.use( mainRequestHandler );
app.use( '/', express.static( path.join( __dirname, "static" )) );

// api
// api.auth
app.post("/api/auth/signin", postAuthSigninHandler);
app.post("/api/auth/signup", postAuthSignupHandler);
app.post("/api/auth/signout", postAuthSignoutHandler);

// final
app.use(finalRequestHandler); // 404 for example

function responseMiddleware( req, res, next)
{
    res.removeHeader("x-powered-by");

    res.append("x-content-type-options", "nosniff");
    res.append("cache-control", "no-cache");
    next();
};

// main middleware
async function mainRequestHandler(request, response, next)
{
    try
    {
        const token = request.cookies.axial_cookie_jwt;
        const currentPath = request.path;
        
        if( currentPath == ROLE_ADMIN_PATH )
        {
            console.log("try to connect admin");
            // we check if connected
            if( token === undefined )
            {
                response.redirect("/");
            }
            else
            {
                // check user
                const verifiedToken = jwt.verify(token, JWT_SECRET_KEY);
                console.log(verifiedToken.uuid);

                const client = await MONGO_CLIENT.connect();
                const db = client.db(DATABASE_NAME);
                const users = db.collection("users");
                const user = await users.findOne( { uuid: verifiedToken.uuid } );
                console.log(user);

                if( user !== null )
                {
                    next();
                }
                else
                {
                    response.redirect("/");
                }
                
            }
        }
        else
        {
            // we redirect public access
            //console.log("public access");
            next();
        }
    }
    catch(err)
    {
        console.log(err);
    }
    finally
    {
        await MONGO_CLIENT.close();
    }
    
};

// final middleware
function finalRequestHandler(req, res, next)
{
    // make redirection here - default 302 so not write
    res.redirect("/");
};

app.listen(PORT);
