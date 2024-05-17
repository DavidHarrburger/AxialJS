import
{
    DATABASE_URL,
    DATABASE_NAME,

    CRYPTO_ALGORITHM,
    CRYPTO_KEY,
    CRYPTO_IV,

    JWT_SECRET_KEY,

    EMAIL_HOST,
    EMAIL_PASS,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_RECIPIENT,

    AUTH_LOGIN_PATH,
    AUTH_PATHES
}
from "./axial-server/AxialServerConstants.js";
import { AxialMongoUtils } from "./axial-server/AxialMongoUtils.js";
import { AxialCryptoUtils } from "./axial-server/AxialCryptoUtils.js";

import express from "express";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { MongoClient, ServerApiVersion } from "mongodb";

const FILENAME = fileURLToPath( import.meta.url );
const DIRNAME = path.dirname(FILENAME);

const BASIC_OK = { status: "ok" };
const BASIC_KO = { status: "ko" };

/*
const EMAIL_TRANSPORTER = nodemailer.createTransport(
{
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true,
    auth:
    {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});
*/

/*
const MONGO_CLIENT = new MongoClient( DATABASE_URL,
    {
        serverApi:
        {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);
*/

///
/// AXIAL MIDDLEWARES
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 * @param { Function } next 
 */
const startMiddleware = function ( request, response, next )
{
    response.append("x-content-type-options", "nosniff");
    response.append("cache-control", "no-cache");
    next();
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 * @param { Function } next 
 */
const authMiddleware = async function( request, response, next )
{
    // First check if auth path is authorized
    const requestedPath = request.path;
    let authRequired = false;

    for( const authPath of AUTH_PATHES )
    {
        if( requestedPath === authPath.path || requestedPath === ( authPath.path + "/" ) )
        {
            authRequired = true;
            break;
        }
    }

    //console.log( "authRequired = " + authRequired );

    if( authRequired === false )
    {
        next();
        return;
    }

    // check now if user is already connected
    const token = request.cookies.axial_auth_jwt;
    console.log( "token = " + token );
    if( token === undefined )
    {
        // token does not exist, the user is not connected so we redirect the user to ask connexion
        response.redirect( AUTH_LOGIN_PATH );
        return;
    }

    // we have a token, time to check it
    try
    {
        const verifiedToken = jwt.verify(token, JWT_SECRET_KEY); // if invalid catch
        const client = await MONGO_CLIENT.connect();
        //console.log("test crash");
        const db = client.db(DATABASE_NAME);
        const users = db.collection("users");
        const user = await users.findOne( { uuid: verifiedToken.uuid } );

        if( user !== null )
        {
            // cool the token is ok and the user exists, he can go to the page
            next();
        }
        else
        {
            // the user does not exist, weird. we redirect to the home
            response.redirect( "/" );
        }
    }
    catch( err )
    {
        console.log(err);
        response.json( { status: "ko", error: err.message } );
    }
    finally
    {
        //await MONGO_CLIENT.close();
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 * @param { Function } next 
 */
const finalMiddleware = function( request, response, next )
{
    response.redirect("/");
};

///
/// MAIL PART
///
const apiMailGetHandler = async function( request, response )
{
    try
    {
        const client = await MONGO_CLIENT.connect();
        const db = client.db( DATABASE_NAME );
        const collection = db.collection("mails");
        const docs = await collection.find({}).toArray();
        console.log(docs);
        let mails = new Array();
        for( const item of docs )
        {
            let mail = {};
            for( const prop of Object.keys( item ) )
            {
                if( typeof item[prop] === "string" )
                {
                    mail[prop] = AxialCryptoUtils.decrypt( item[prop] );
                }
                else
                {
                    mail[prop] = item[prop];
                }
            }
            mails.push( mail );
        }
        response.json( { status: "ok", mails: mails } );
    }
    catch(err)
    {
        console.log(err);
        response.json( { status: "ko", error: err } );
    }
};
/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiMailMessagePostHandler = async function( request, response )
{
    try
    {
        let body = request.body;
        const infos = { name: body.name, surname: body.surname, email: body.email, message: body.message };

        // check body


        //await AxialMongoUtils.registerInCollection( MONGO_CLIENT, "mails", body, true );

        let htmlFrom = "<h2>Votre message à dndev.fr !</h2>";
        htmlFrom += "<p>Merci d'avoir pris contact. Nous vous répondrons dans les plus brefs délais. Ci-dessous le message que vous avez envoyé :";
        htmlFrom += "<p style='font-style: italic'>" + infos.message + "</p>";

        const mailFrom = await EMAIL_TRANSPORTER.sendMail(
        {
            from: "<no-reply@dndev.fr>",
            to: infos.email,
            subject: "Votre message à dndev.fr",
            html: htmlFrom
        });

        let htmlTo = "<h4>Nouveau message depuis dndev.fr</h4>";
        htmlTo += "<p><span style='font-weight: bold'>" + infos.name + "</span> " + infos.email + " a envoyé un message</p>";
        htmlTo += "<p style='font-style: italic'>" + infos.message + "</p>";
        htmlTo += mailFrom.messageId;

        const mailTo = await EMAIL_TRANSPORTER.sendMail(
        {
            from: "<" + infos.email + ">",
            to: EMAIL_RECIPIENT,
            subject: "Message from dndev.fr",
            html: htmlTo
        });

        response.json( { status: "ok", mid: mailFrom.messageId } );
    }
    catch( err )
    {
        console.log(err);
        response.json( { status: "ko", error: err } );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiMailContactPostHandler = async function( request, response )
{
    try
    {
        const body = request.body;
        //const infos = { name: body.name, email: body.email, message: body.message };

        const NAME = body.name;
        const SURNAME = body.surname;
        const EMAIL = body.email;
        const TEL = body.tel;
        const ADDRESS = body.address;
        const ZIP = body.zip;
        const CITY = body.city;
        const MESSAGE = body.message;

        let htmlFrom = "<h4>Votre message envoyé depuis dndev.fr</h4>";
        htmlFrom += "<p>Merci d'avoir pris contact. Nous vous répondrons dans les plus brefs délais. Ci-dessous le message que vous nous avez envoyé :";
        htmlFrom += "<p style='font-style: italic'>" + MESSAGE + "</p>";

        const mailFrom = await EMAIL_TRANSPORTER.sendMail(
        {
            from: "<" + EMAIL_USER + ">",
            to: EMAIL,
            subject: "Votre message à D n' Dev",
            html: htmlFrom
        });

        let htmlTo = "<h4>Nouveau message depuis dndev.fr</h4>";
        htmlTo += "<p>Voici un nouveau message envoyé depuis dndev.fr !</p>";
        htmlTo += "<div><span style='font-weight: bold'>PRENOM : </span>" + NAME + "</div>";
        htmlTo += "<div><span style='font-weight: bold'>NOM : </span>" + SURNAME + "</div>";
        htmlTo += "<div><span style='font-weight: bold'>EMAIL : </span>" + EMAIL + "</div>";
        htmlTo += "<div><span style='font-weight: bold'>TEL : </span>" + TEL + "</div>";
        htmlTo += "<div><span style='font-weight: bold'>ADRESSE : </span>" + ADDRESS + "</div>";
        htmlTo += "<div><span style='font-weight: bold'>CODE POSTAL : </span>" + ZIP + "</div>";
        htmlTo += "<div><span style='font-weight: bold'>VILLE : </span>" + CITY + "</div>";
        htmlTo += "<div><span style='font-weight: bold'>MESSAGE : </span></div>";
        htmlTo += "<p style='font-style: italic'>" + MESSAGE + "</p>";
        htmlTo += mailFrom.messageId;

        
        const mailTo = await EMAIL_TRANSPORTER.sendMail(
        {
            from: "<" + EMAIL + ">",
            to: EMAIL_RECIPIENT,
            subject: "Nouveau message depuis dndev.fr",
            html: htmlTo
        });
        
        response.json( { status: "ok", mid: mailFrom.messageId } );
    }
    catch( err )
    {
        console.log(err);
        response.json( { status: "ko", error: err } );
    }
};

///
/// STATS PART
///

const apiStatsAddHandler = async function( request, response )
{
    try
    {
        const body = request.body;
        await AxialMongoUtils.registerInCollection( MONGO_CLIENT, "stats", body );
        response.json( BASIC_OK );
    }
    catch(err)
    {
        console.log(err);
        response.json( { status: "ko", error: err } );
    }
};

const apiStatsGetHandler = async function( request, response )
{
    try
    {
        const client = await MONGO_CLIENT.connect();
        const db = client.db( DATABASE_NAME );
        const collection = db.collection("stats");
        const docs = await collection.find({}).toArray();
        response.json( { status: "ok", stats: docs } );
    }
    catch(err)
    {
        console.log(err);
        response.json( { status: "ko", error: err } );
    }
};

///
/// CRYPTO PART
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiCryptoUuidHandler = function( request, response )
{
    try
    {
        const uuid = crypto.randomUUID();
        response.json( { status: "ok", uuid: uuid } );
    }
    catch( err )
    {
        console.log(err);
        response.json( { status: "ko", error: err } );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiCryptoKeyHandler = function( request, response )
{
    try
    {
        const n = Number(request.query.n);
        const key = AxialCryptoUtils.generateKey(n);
        response.json( { status: "ok", key: key } );
    }
    catch( err )
    {
        console.log(err);
        response.json( { status: "ko", error: err } );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiCryptoEncryptHandler = function( request, response )
{
    try
    {
        const s = request.query.s;
        if( s == undefined || s == "" )
        {
            response.json( { status: "ko", error: "no string provided" } );
        }
        else
        {
            const encrypted = AxialCryptoUtils.encrypt(s);
            response.json( { status: "ok", encrypted: encrypted } );
        }
    }
    catch( err )
    {
        console.log(err);
        response.json( { status: "ko", error: err } );
    }
};

///
/// LOGIN PART
///

const apiAuthSigninHandler = async function( request, response )
{
    try
    {
        const body = request.body;

        const email = body.email;
        const password = body.password;

        const client = await MONGO_CLIENT.connect();
        const db = client.db( DATABASE_NAME );
        const users = db.collection("users");
        const encryptedEmail = AxialCryptoUtils.encrypt( email );
        const user = await users.findOne( { email: encryptedEmail } );
        
        if( user === null )
        {
            response.json( { status: "ko", message: "user email not registered" } );
        }
        else
        {
            const encryptedPassword = AxialCryptoUtils.encrypt( password );
            const passwordValid = user.password === encryptedPassword;
            if( passwordValid === false )
            {
                // add a secure layer in the user object and a count on the server
                response.json( { status: "ko", message: "wrong password" } );
            }
            else
            {
                console.log("it's okkkkkk");
                const responseUser = { username: user.username };
                const payload = 
                {
                    username: user.username,
                    uuid: user.uuid,
                };
                const token = jwt.sign( JSON.stringify(payload), JWT_SECRET_KEY );

                response.cookie( "axial_auth_jwt", token, { httpOnly: true } );
                response.json( { status: "ok", message: "connected", user: responseUser } );
            }
        }
    }
    catch( err )
    {
        response.json( { status: "ko", error: err.message } );
    }
    finally
    {
        //await MONGO_CLIENT.close();
    }
};


const apiAuthSignupHandler = function( request, response )
{
    response.json( BASIC_OK );
};

// post
const apiAuthSignoutHandler = function( request, response )
{
    try
    {
        response.clearCookie( "axial_auth_jwt", { httpOnly: true } );
        response.json( { status: "ok", message: "disconnected" } );
    }
    catch(err)
    {
        console.log(err);
    }
};

///
/// SERVER ROUTES
///

const AXIAL_SERVER_APPLICATION = express();

AXIAL_SERVER_APPLICATION.disable("x-powered-by");

AXIAL_SERVER_APPLICATION.use( startMiddleware );
AXIAL_SERVER_APPLICATION.use( express.json() );
AXIAL_SERVER_APPLICATION.use( express.urlencoded( { extended: true } ) );
AXIAL_SERVER_APPLICATION.use( cookieParser() );

//AXIAL_SERVER_APPLICATION.use( authMiddleware );

//AXIAL_SERVER_APPLICATION.get( "/api/mail/get", apiMailGetHandler );
//AXIAL_SERVER_APPLICATION.post( "/api/mail/message", apiMailMessagePostHandler );
//AXIAL_SERVER_APPLICATION.post( "/api/mail/contact", apiMailContactPostHandler );

//AXIAL_SERVER_APPLICATION.get( "/api/stats/get", apiStatsGetHandler );
//AXIAL_SERVER_APPLICATION.post( "/api/stats/add", apiStatsAddHandler );

//AXIAL_SERVER_APPLICATION.get( "/api/crypto/uuid", apiCryptoUuidHandler );
//AXIAL_SERVER_APPLICATION.get( "/api/crypto/key", apiCryptoKeyHandler );
//AXIAL_SERVER_APPLICATION.get( "/api/crypto/encrypt", apiCryptoEncryptHandler );

//AXIAL_SERVER_APPLICATION.post( "/api/auth/signin", apiAuthSigninHandler);
// //AXIAL_SERVER_APPLICATION.post( "/api/auth/signup", apiAuthSignupHandler);
//AXIAL_SERVER_APPLICATION.post( "/api/auth/signout", apiAuthSignoutHandler);

AXIAL_SERVER_APPLICATION.use( "/", express.static( path.join( DIRNAME, "static" )) );

AXIAL_SERVER_APPLICATION.use( finalMiddleware );

export default AXIAL_SERVER_APPLICATION;