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

    ROLES,

    MEDIAS_FOLDER,
    UPLOADS_FOLDER,

    AUTH_LOGIN_PATH,
    AUTH_VERIFICATION_PATH,
    AUTH_REGISTER_PATH,
    AUTH_REDIRECT_PATH,
    AUTH_PATHES,

    API_PRIVATE_PATHES,

    SUBSCRIPTION_REQUIRED,
    SUBSCRIPTION_FREE_DAY,
    SUBSCRIPTION_PAYMENT_PATH,

    STRIPE_PRIVATE_KEY,
    STRIPE_USE
}
from "./axial-server/AxialServerConstants.js";
import { AxialCryptoUtils } from "./axial-server/AxialCryptoUtils.js";
import { AxialServerUtils } from "./axial-server/AxialServerUtils.js";
import { AxialMongo } from "./axial-server/AxialMongo.js";
import { AxialMailer } from "./axial-server/AxialMailer.js";
import { AxialScheduler } from "./axial-server/AxialScheduler.js";
import { AxialSchedulerTask } from "./axial-server/schedule/AxialSchedulerTask.js";
import { AxialSchedulerOperations } from "./axial-server/schedule/AxialSchedulerOperations.js";
import { AxialPdfMaker } from "./axial-server/pdf/AxialPdfMaker.js";

import express from "express";
import path, { dirname } from "node:path";
import crypto from "node:crypto";
//import { Buffer } from "node:buffer"; // to check
import fs from "node:fs";
import fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";

import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import Stripe from "stripe";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";


const FILENAME = fileURLToPath( import.meta.url );
const DIRNAME = path.dirname(FILENAME);

const BASIC_OK = { status: "ok" };
const BASIC_KO = { status: "ko" };

const multerUploader = multer();

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
const AXIAL_MAILER = new AxialMailer( EMAIL_TRANSPORTER );

const AXIAL_MONGO = new AxialMongo( DATABASE_URL, DATABASE_NAME );

const STRIPE = STRIPE_PRIVATE_KEY !== "" ? new Stripe(STRIPE_PRIVATE_KEY) : undefined;




AxialSchedulerOperations.mongo = AXIAL_MONGO;
AxialSchedulerOperations.mailer = AXIAL_MAILER;

// defines the tasks
const testTaskAsync = new AxialSchedulerTask();
testTaskAsync.isRecurring = true;
testTaskAsync.operation = AxialSchedulerOperations.sendAnalyticsReport;


const AXIAL_SCHEDULER = new AxialScheduler();
AXIAL_SCHEDULER.addTask( testTaskAsync );
AXIAL_SCHEDULER.start();

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
    response.append("X-Frame-Options", "SAMEORIGIN");
    response.append("Cross-Origin-Opener-Policy", "same-origin");
    response.append("Strict-Transport-Security", "max-age=604800; includeSubDomains;");
    if( request.hostname !== "localhost" )
    {
        response.append("Content-Security-Policy", "default-src 'self'");    
    }
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
    const isAPI = requestedPath.indexOf("/api/") === 0;
    let authRequired = false;
    let verificationRequired = false;
    let pathToCheck;

    let isSpecialPath = false;

    if( isAPI === false )
    {
        for( const authPath of AUTH_PATHES )
        {
            if( requestedPath === authPath.path || requestedPath === ( authPath.path + "/" ) )
            {
                authRequired = true;
                pathToCheck = authPath;
                if( authPath.path !== AUTH_VERIFICATION_PATH )
                {
                    verificationRequired = true;
                }
                break;
            }
        }
        if( requestedPath === AUTH_LOGIN_PATH ||
            requestedPath === AUTH_LOGIN_PATH + "/" || 
            requestedPath === AUTH_REGISTER_PATH || 
            requestedPath === AUTH_REGISTER_PATH + "/" )
        {
            isSpecialPath = true;
        }
    }
    else
    {
        for( const apiPath of API_PRIVATE_PATHES )
        {
            if( requestedPath === apiPath.path || requestedPath === ( apiPath.path + "/" ) )
            {
                authRequired = true;
                verificationRequired = apiPath.verification;
                pathToCheck = apiPath;
                break;
            }
        }
    }
    
    
    if( authRequired === false && isSpecialPath === false )
    {
        next();
        return;
    }
    
    /// AUTH REQUIRED TRUE HERE
    // check now if user is already connected
    const token = request.cookies.axial_auth_jwt;

    if( token === undefined )
    {
        // token does not exist, the user is not connected so we redirect the user to ask connexion
        if( isAPI === false )
        {
            if( isSpecialPath === true )
            {
                next();
            }
            else
            {
                response.redirect( AUTH_LOGIN_PATH ); // TODO integrate the page asked for to do the good routing
            }
            return;
        }
        else
        {
            response.json( { status: "ko", message: "unauthorized api access" } );
            return;
        }
    }

    // we have a token, time to check it
    try
    {
        const verifiedToken = jwt.verify(token, JWT_SECRET_KEY); // if invalid catch
        const user = await AXIAL_MONGO.getData("users", { uuid: verifiedToken.uuid } );
        
        if( user !== null )
        {
            response.locals.user = user;
            
            // cool the token is ok and the user exists, we now go the redirect middleware
            if( user.verified === false )
            {
                if( isAPI === false )
                {
                    if( verificationRequired === false && isSpecialPath === false )
                    {
                        next();
                    }
                    else
                    {
                        response.redirect(AUTH_VERIFICATION_PATH);
                    }
                }
                else
                {
                    if( verificationRequired === false )
                    {
                        next();
                    }
                    else
                    {
                        response.json( { status: "ko", message: "unauthorized api access" } );
                    }
                }
            }
            else
            {
                // user verified always true here
                // if user has to pay go
                const role = user.role;
                if( role === "user" && SUBSCRIPTION_REQUIRED === true && requestedPath !== SUBSCRIPTION_PAYMENT_PATH )
                {
                    response.redirect(SUBSCRIPTION_PAYMENT_PATH);
                    return;
                }
                
                if( isSpecialPath === true || requestedPath === AUTH_VERIFICATION_PATH  || requestedPath === AUTH_VERIFICATION_PATH + "/" )
                {
                    for( const authPath of AUTH_PATHES )
                    {
                        if( role === authPath.permission )
                        {
                            response.redirect(authPath.path);
                            break;
                        }
                    }
                }
                else if( pathToCheck !== undefined )
                {
                    if( isAPI === false )
                    {
                        if( pathToCheck.permission !== role )
                        {
                            response.redirect("/");
                        }
                        else
                        {
                            next();
                        }
                    }
                    else
                    {
                        // check api role here
                        next();
                    }
                }
                else
                {
                    next();
                }
            }
        }
        else
        {
            // the user does not exist, weird. we redirect to the home
            if( isAPI === false )
            {
                response.redirect( "/" );
            }
            else
            {
                response.json( { status: "ko", message:"API access error" } );
            }
        }
        
    }
    catch( err )
    {
        console.log(err);
        response.json( { status: "ko", error: err.message } );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 * @param { Function } next 
 */
const authRedirectMiddleware = async function( request, response, next )
{
    next();
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
/// STATS PART
///

/**
 * POST
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiStatsAddHandler = async function( request, response )
{
    try
    {
        const body = request.body;
        const user = response.locals.user;

        let statDoc = body;
        body.ip = request.ip;
        body.ips = request.ips;
        if( user && user.uuid )
        {
            body.user = user.uuid
        }
        else
        {
            body.user = "";
        }

        const result = await AXIAL_MONGO.setData("stats", statDoc);
        
        response.json( BASIC_OK );
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
const apiStatsGetHandler = async function( request, response )
{
    try
    {
        const docs = await AXIAL_MONGO.getData("stats");
        response.json( { status: "ok", stats: docs } );
    }
    catch(err)
    {
        console.log(err);
        response.json( { status: "ko", error: err } );
    }
};


///
/// LOGIN PART
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiAuthSigninHandler = async function( request, response )
{
    try
    {
        const body = request.body;

        const email = body.email;
        const password = body.password;
        const encryptedEmail = AxialCryptoUtils.encrypt( email );
        const user = await AXIAL_MONGO.getData( "users", {email: encryptedEmail} );
        
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
                const verifiedUser = await AXIAL_MONGO.updateData("users", { uuid: user.uuid }, { $set: { verified: false } } );
                const payload = 
                {
                    username: user.username,
                    uuid: user.uuid,
                };
                const token = jwt.sign( JSON.stringify(payload), JWT_SECRET_KEY );

                // here page to redirect

                response.cookie( "axial_auth_jwt", token, { httpOnly: true } );
                response.json( { status: "ok" } );
            }
        }
    }
    catch( err )
    {
        response.json( { status: "ko", error: err.message } );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiAuthCodeSendHandler = async function( request, response )
{
    try
    {
        // check if user exists
        // check if timecode exist if yes replace
        const user = response.locals.user;
        const tempCode = AxialServerUtils.getVerificationCode();
        const decryptedEmail = AxialCryptoUtils.decrypt( user.email );
        const timeResult = await AXIAL_MONGO.setTimeCode( tempCode, user.email );

        await AXIAL_MAILER.sendMail( "Your verification code", decryptedEmail, "sendcode", { code: tempCode } );

        response.json( { email: decryptedEmail } )
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
const apiAuthCodeVerifyHandler = async function( request, response )
{
    try
    {
        const user = response.locals.user;
        const code = request.body.code;
        const timeFilter = { timecode: code, timechecker: user.email };
        const timeResult = await AXIAL_MONGO.getData("codes", timeFilter);
        if( Array.isArray(timeResult) && timeResult.length === 0 )
        {
            response.json(BASIC_KO);
        }
        else
        {
            const userUpdated = await AXIAL_MONGO.updateData("users", {email: user.email}, {$set: {verified: true}});
            const currentUser = await AXIAL_MONGO.getData( "users", {uuid: user.uuid} );
            let redirection = "";
            if( SUBSCRIPTION_REQUIRED === true && currentUser.role === "user" )
            {
                redirection = SUBSCRIPTION_PAYMENT_PATH;
            }
            else
            {
                redirection = "/" + user.role + "/";
            }
            const jsonResponse = { status: "ok", uuid: user.uuid, path: redirection };
            response.json(jsonResponse);
        }
        
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
const apiAuthSignupHandler = async function( request, response )
{
    // check username
    const body = request.body;
    const email = body.email;
    const pass = body.password;
    try
    {
        const encryptedEmail = AxialCryptoUtils.encrypt( email );
        const possibleUsers = await AXIAL_MONGO.getData("users", { model: "user", email: encryptedEmail } );
        if( possibleUsers === null )
        {
            const newUserResult = await AXIAL_MONGO.setData("users", body, "user");
            const newUser = await AXIAL_MONGO.getData("users", { model: "user", email: encryptedEmail } );

            const payload = 
            {
                username: newUser.username,
                uuid: newUser.uuid,
            };
            const token = jwt.sign( JSON.stringify(payload), JWT_SECRET_KEY );

            response.cookie( "axial_auth_jwt", token, { httpOnly: true } );
            response.json(BASIC_OK);
        }
        else
        {
            // user alreafy exists
            response.json(BASIC_KO);
        }
        
    }
    catch(err)
    {
        console.log(err);
        response.json( { status: "ko", error: err } );
    }
};

/**
 * POST
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
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
        response.json( { status: "ko", error: err } );
    }
};

///
/// MEDIAS PART
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiMediasGetHandler = async function( request, response )
{
    try
    {
        const localUser = response.locals.user;

        const q = request.query;
        const fileName = q.f;

        const filePath = path.join( DIRNAME, UPLOADS_FOLDER, localUser.uuid, fileName );
        const fileExists = fs.existsSync(filePath);
        
        if( fileExists === true )
        {
            response.sendFile(filePath);
        }
        else
        {
            response.json({status: "ko", error: "file does not exist"});    
        }
        
    }
    catch(err)
    {
        console.log( err );
        response.json( { status: "ko", error: err.message } );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiMediasAllHandler = async function( request, response )
{
    try
    {
        const localUser = response.locals.user;
        const localUserMediasPath = path.join( DIRNAME, UPLOADS_FOLDER, localUser.uuid );
        const dirExists = fs.existsSync(localUserMediasPath);
        if( dirExists === false )
        {
            const localUserMediaDir = await fsp.mkdir(localUserMediasPath);
        }
        const localUserMedias = await fsp.readdir(localUserMediasPath);
        
        response.json({status: "ok", medias: localUserMedias});
    }
    catch(err)
    {
        console.log( err );
        response.json( { status: "ko", error: err.message } );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiMediasPublicHandler = async function( request, response )
{
    try
    {
        
        const publicMediasPath = path.join( DIRNAME, MEDIAS_FOLDER );
        const dirExists = fs.existsSync(publicMediasPath);
        if( dirExists === true )
        {
            const publicMedias = await fsp.readdir(publicMediasPath);
            response.json( { status: "ok", medias: publicMedias } );
        }
        else
        {
            response.json( { status: "ok", medias: [] } );
        }
    }
    catch(err)
    {
        console.log( err );
        response.json( { status: "ko", error: err.message } );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiMediasUploadHandler = async function( request, response )
{
    try
    {
        // auth middleware
        const user = response.locals.user;
        // multer
        const upFile = request.file;
        const fileName = upFile.originalname;
        const fileData = upFile.buffer;

        //const filePublic = Boolean( Number( request.get("axial_filepublic") ) );
        
        /// ALWAYS PUBLIC AT THE MOMENT
        
        const finalFileName = String( Date.now() ) + "_____" + fileName;

        // check if directory exists and if it is accessible
        const mediasPath = path.join( DIRNAME, MEDIAS_FOLDER );
        const userMediasPath = path.join(mediasPath, user.uuid);
        const access = fs.existsSync(mediasPath);
        
        if( access === false )
        {
            // not exist, we create it
            const mediasFolder = await fsp.mkdir(mediasPath);
            const userMediasFolder = await fsp.mkdir(userMediasPath);
        }
        else
        {
            // the media folder exists, we check the user medias one
            const userMediasAccess = fs.existsSync(userMediasPath);
            if( userMediasAccess === false )
            {
                const userMediasFolder = await fsp.mkdir(userMediasPath);
            }
        }
        
        const filePath = path.join( userMediasPath, finalFileName );
        const uploadedFile = await fsp.writeFile( filePath, fileData, {encoding: "base64"} );
        const relativeFilePath = `./${MEDIAS_FOLDER}/${user.uuid}/${finalFileName}`;
        
        response.json( { status: "ok", message: `${fileName} successfully uploaded`, path: relativeFilePath } );
    }
    catch(err)
    {
        console.log(err);
        response.json( { status: "ko", message: "upload error" } );
    }
};



///
/// 2025
///
const apiDataGet = async function( request, response )
{
    try
    {
        let documents = new Array();
        let collection = "";
        let filters = {};
        let model = "";

        //const collectionName = request.query.c;

        const query = request.query;
        for( const p of Object.keys(query) )
        {
            const v = query[p];
            switch( p )
            {
                case "c":
                    if( typeof v === "string" )
                    {
                        collection = v;
                    }
                break;

                case "m":
                    if( typeof v === "string" )
                    {
                        model = v;
                    }
                break;

                case "f":
                    if( typeof v === "string" )
                    {
                        // assumes coma is here
                        // check the number of comas
                        // check if values are not empty
                        // move to a util that Create the filter mays AxialMongo.createFilter or AxialMongo.parseFilter
                        const nc = ( v.match( new RegExp(",", "g") ) || [] ).length;
                        if( nc === 1 )
                        {
                            const fa = v.split(",");
                            let filterKey = fa[0];
                            let filterValue = fa[1];

                            if( filterKey !== "" && filterValue !== "" )
                            {
                                if( filterKey === "_id" )
                                {
                                    filterValue = new ObjectId( String(filterValue) );
                                }
                                filters[filterKey] = filterValue;
                                //filters[fa[0]] = fa[1];
                            }
                        }
                    }
                    else if( Array.isArray(v) === true )
                    {
                        for( const pkv of v )
                        {
                            const nc = ( pkv.match( new RegExp(",", "g") ) || [] ).length;
                            if( nc === 1 )
                            {
                                const fa = pkv.split(",");
                                let filterKey = fa[0];
                                let filterValue = fa[1];

                                if( filterKey !== "" && filterValue !== "" )
                                {
                                    // SUPER IMPORTNAT CHECK HERE BUT NOT CRASHING
                                    if( filterKey === "_id" )
                                    {
                                        filterValue = new ObjectId( String(filterValue) );
                                    }
                                    filters[filterKey] = filterValue;
                                    //filters[fa[0]] = fa[1];
                                }
                            }
                        }
                    }
                break;

                default:
                break;
            }
        }

        if( collection !== "" )
        {
            documents = await AXIAL_MONGO.getData( collection, filters, model );
        }

        if( documents === null )
        {
            documents = [];
        }
        else if( Array.isArray(documents) === false )
        {
            documents = [documents];
        }
        
        const result = { status: "ok", content: documents };
        response.json( result );
    }
    catch( err )
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

const apiDataSet = async function( request, response )
{
    try
    {
        const doc = request.body;
        const col = doc.collection;
        const model = doc.model;
        const insertedOrReplaced = await AXIAL_MONGO.setData( col, doc, model );
        
        const result = { status: "ok", content: insertedOrReplaced };
        response.json( result );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

const apiDataDel = async function( request, response )
{
    console.log("API_DATA_DEL");
    try
    {
        const doc = request.body;
        const collection = doc.collection;
        const uuid = doc.uuid;
        const deletion = await MONGO.delData(collection, uuid);
        const result = { status: "ok", content: deletion };
        response.json( result );
    }
    catch( err )
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

///
/// PARAMS
///

const apiParamsInfobarGet = async function( request, response )
{
    console.log("API_PARAMS_INFOBAR_GET");
    try
    {
        const param = await AXIAL_MONGO.getData("params", {model: "info_bar"}, "info_bar");
        console.log("param info bar", param);
        const result = { status: "ok", content: param };
        response.json(result);
    }
    catch(err)
    {
        console.log(err);
    }
}

const apiParamsInfobarSet = async function( request, response )
{
    try
    {
        const doc = request.body;
        console.log( doc )
        const infobarUpdated = await AXIAL_MONGO.setData("params", doc, "info_bar");
        response.json(BASIC_OK);
    }
    catch(err)
    {
        console.log(err);
    }
}


///
/// STRIPE TEST
///

const apiProductsSet = async function( request, response )
{
    try
    {
        let body = request.body;
        let stripeProduct;
        if( STRIPE_USE === true )
        {
            let stripeProductObject = {};
            stripeProductObject.active = true;
            if( body.items && Array.isArray( body.items) )
            {
                for( const item of body.items )
                {
                    if( item.field && item.value )
                    {
                        // super nullissime
                        let realValue;
                        if( Array.isArray( item.value ) )
                        {
                            realValue = item.value[0].value;
                        }
                        else
                        {
                            realValue = item.value;
                        }

                        switch( item.field )
                        {
                            case "name":
                                stripeProductObject.name = realValue;
                            break;

                            case "description":
                                stripeProductObject.description = realValue;
                            break;

                            case "image_main":
                                stripeProductObject.images = [ realValue ];
                            break;

                            default:
                            break;
                        }
                    }
                }
            }
            const tempStripeProduct = await STRIPE.products.create(stripeProductObject);
        }
        response.json( BASIC_OK );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};


// under dev
const apiPricesSet = async function( request, response )
{
    try
    {
        let body = request.body;
        let stripeProduct;
        if( STRIPE_USE === true )
        {
            let stripeProductObject = {};
            stripeProductObject.active = true;
            if( body.items && Array.isArray( body.items) )
            {
                for( const item of body.items )
                {
                    if( item.field && item.value )
                    {
                        // super nullissime
                        let realValue;
                        if( Array.isArray( item.value ) )
                        {
                            realValue = item.value[0].value;
                        }
                        else
                        {
                            realValue = item.value;
                        }

                        switch( item.field )
                        {
                            case "name":
                                stripeProductObject.name = realValue;
                            break;

                            case "description":
                                stripeProductObject.description = realValue;
                            break;

                            case "image_main":
                                stripeProductObject.images = [ realValue ];
                            break;

                            default:
                            break;
                        }
                    }
                }
            }
            const tempStripeProduct = await STRIPE.products.create(stripeProductObject);
        }
        response.json( BASIC_OK );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

// under dev
const apiPayClientAdd = async function( request, response )
{
    try
    {
        const testStripeClient = await STRIPE.customers.create({email: "test@test.fr"});
        response.json( BASIC_KO );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

///
/// PDF TEST
///

//const pdfMaker = new AxialPdfMaker();
//pdfMaker.create();

///
/// SERVER ROUTES
///

const AXIAL_SERVER_APPLICATION = express();

AXIAL_SERVER_APPLICATION.disable("x-powered-by");

AXIAL_SERVER_APPLICATION.use( startMiddleware );
AXIAL_SERVER_APPLICATION.use( express.json() );
AXIAL_SERVER_APPLICATION.use( express.urlencoded( { extended: true } ) );
AXIAL_SERVER_APPLICATION.use( cookieParser() );

// TO TEST IMPORTANT
AXIAL_SERVER_APPLICATION.use( authMiddleware );
//AXIAL_SERVER_APPLICATION.use( authRedirectMiddleware );

// 2025 PRIVATE API
AXIAL_SERVER_APPLICATION.get( "/api/data/get", apiDataGet );
AXIAL_SERVER_APPLICATION.post( "/api/data/set", apiDataSet );
AXIAL_SERVER_APPLICATION.post( "/api/data/del", apiDataDel);

// STATS
AXIAL_SERVER_APPLICATION.get( "/api/stats/get", apiStatsGetHandler );
AXIAL_SERVER_APPLICATION.post( "/api/stats/add", apiStatsAddHandler );

// PARAMS
AXIAL_SERVER_APPLICATION.get( "/api/params/infobar/get", apiParamsInfobarGet );
AXIAL_SERVER_APPLICATION.post( "/api/params/infobar/set", apiParamsInfobarSet );

// AUTH
AXIAL_SERVER_APPLICATION.post( "/api/auth/signin", apiAuthSigninHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/signup", apiAuthSignupHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/signout", apiAuthSignoutHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/code/send", apiAuthCodeSendHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/code/verify", apiAuthCodeVerifyHandler);

// MEDIAS
AXIAL_SERVER_APPLICATION.get( "/api/medias/get", apiMediasGetHandler );
AXIAL_SERVER_APPLICATION.get( "/api/medias/all", apiMediasAllHandler );
AXIAL_SERVER_APPLICATION.get( "/api/medias/public", apiMediasPublicHandler );
AXIAL_SERVER_APPLICATION.post( "/api/medias/upload", multerUploader.single("axial_file"), apiMediasUploadHandler );

// PRODUCTS
AXIAL_SERVER_APPLICATION.post( "/api/products/set", apiProductsSet );

// PRICES
//AXIAL_SERVER_APPLICATION.post( "/api/prices/set", apiPricesSet );

// PAYMENTS
//AXIAL_SERVER_APPLICATION.get("/api/pay/client/add", apiPayClientAdd);


AXIAL_SERVER_APPLICATION.use( "/", express.static( path.join( DIRNAME, "static" )) );
// NO DEV FOLDER
AXIAL_SERVER_APPLICATION.use( "/medias", express.static( path.join( DIRNAME, MEDIAS_FOLDER )) );

AXIAL_SERVER_APPLICATION.use( finalMiddleware );

export default AXIAL_SERVER_APPLICATION;