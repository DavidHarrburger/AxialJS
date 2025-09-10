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
    SUBSCRIPTION_CHECKOUT_PATH,

    STRIPE_PRIVATE_KEY,
    STRIPE_USE,
    STRIPE_WEBHOOK_SECRET
}
from "./axial-server/AxialServerConstants.js";
import { AxialCryptoUtils } from "./axial-server/AxialCryptoUtils.js";
import { AxialServerUtils } from "./axial-server/AxialServerUtils.js";
import { AxialServerFileUtils } from "./axial-server/utils/AxialServerFileUtils.js";
import { AxialMongo } from "./axial-server/AxialMongo.js";
import { AxialMailer } from "./axial-server/AxialMailer.js";
import { AxialScheduler } from "./axial-server/AxialScheduler.js";
import { AxialSchedulerTask } from "./axial-server/schedule/AxialSchedulerTask.js";
import { AxialSchedulerOperations } from "./axial-server/schedule/AxialSchedulerOperations.js";
import { AxialPdfMaker } from "./axial-server/pdf/AxialPdfMaker.js";

import express from "express";
import path, { dirname } from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";

import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import Stripe from "stripe";
import QRCode from "qrcode";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { AxialStripe } from "./axial-stripe/AxialStripe.js";

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
const AXIAL_STRIPE = STRIPE_PRIVATE_KEY !== "" ? new AxialStripe(STRIPE_PRIVATE_KEY) : undefined;

///
/// AUTOMATION
///

AxialSchedulerOperations.mongo = AXIAL_MONGO;
AxialSchedulerOperations.mailer = AXIAL_MAILER;

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
        //response.append("Content-Security-Policy", "default-src 'self'"); // check default may miss = or :
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
            
            // cool the token is ok and the user exists, we now go with the redirect middlewares
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
                // problem somewhere with isAPI === false
                // user verified always true here
                // if user has to pay to go
                const role = user.role;

                if( role === "user" )
                {
                    // subscription is required
                    if( SUBSCRIPTION_REQUIRED === true && requestedPath !== SUBSCRIPTION_CHECKOUT_PATH && isAPI === false && user.stripe_subscription_status !== "active" )
                    {
                        response.redirect(SUBSCRIPTION_CHECKOUT_PATH);
                        return;
                    }
                }
                // role  === client will go here
                
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
                        //console.log( "POSSIBLE BUG HERE" );
                        //console.log( role, pathToCheck.permission );
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
                response.clearCookie( "axial_auth_jwt", { httpOnly: true } );
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
                    first_name: user.first_name,
                    last_name: user.last_name,
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
            if( SUBSCRIPTION_REQUIRED === true && currentUser.role === "user" && currentUser.stripe_subscription_status !== "active" )
            {
                redirection = SUBSCRIPTION_CHECKOUT_PATH;
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
    let body = request.body;
    const email = body.email;
    const pass = body.password;
    try
    {
        const encryptedEmail = AxialCryptoUtils.encrypt( email );
        const possibleUsers = await AXIAL_MONGO.getData("users", { model: "user", email: encryptedEmail } );
        console.log( possibleUsers );
        if( possibleUsers === null )
        {
            if( STRIPE_USE === true )
            {
                const stripeName = `${body.first_name} ${body.last_name}`;
                const stripeCustomerObject = 
                {
                    name: stripeName,
                    email: email
                }
                const stripeCustomer = await AXIAL_STRIPE.setCustomer( stripeCustomerObject );
                //console.log(stripeCustomer);
                if( stripeCustomer !== undefined )
                {
                    body.stripe_customer_id = stripeCustomer.id;
                }
            }

            const newUserResult = await AXIAL_MONGO.setData("users", body, "user");
            const newUser = await AXIAL_MONGO.getData("users", { model: "user", email: encryptedEmail } );

            const payload = 
            {
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                uuid: newUser.uuid,
            };
            const token = jwt.sign( JSON.stringify(payload), JWT_SECRET_KEY );

            response.cookie( "axial_auth_jwt", token, { httpOnly: true } );
            response.json(BASIC_OK);
        }
        else
        {
            // user already exists
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
/// DATA MAIN PART
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
        console.log(documents)
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
        const model = doc.model;
        const _id = doc._id;
        const deletion = await AXIAL_MONGO.delData(model, _id);
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
        statDoc.ip = request.ip;
        statDoc.ips = request.ips;
        if( user && user.uuid )
        {
            statDoc.user = user.uuid;
        }
        else
        {
            statDoc.user = "";
        }

        // user toujours === "" / api public à revoir
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
/// FILES
///

const apiFilesGetAllHandler = async function( request, response )
{
    console.log("API_FILES_GET_ALL");
    try
    {
        const user = response.locals.user;
        const publicUserMediasPath = path.join( DIRNAME, MEDIAS_FOLDER, user.uuid );
        const tree = await AxialServerFileUtils.getDirTree( publicUserMediasPath );
        const result = { status: "ok", content: tree };
        response.json(result);
    }
    catch(err)
    {
        console.log(err);
    }
};

///
/// HOME -> KPI ATM
///

const apiKpiGetDatabase = async function( request, response )
{
    console.log("API_KPI_DATABASE_GET");
    try
    {
        const stats = await AXIAL_MONGO.getDatabaseStats();
        const result = 
        {
            status: "ok",
            content: stats
        }
        response.json( result );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

const apiKpiGetFileStorage = async function( request, response )
{
    console.log("API_KPI_STORAGE_GET");
    try
    {
        const user = response.locals.user;
        let stats = {};
        if( user.uuid )
        {
            const publicUserMediasPath = path.join( DIRNAME, MEDIAS_FOLDER, user.uuid );
            const dirExists = fs.existsSync(publicUserMediasPath);
            if( dirExists === true )
            {
                stats = await AxialServerFileUtils.getDirSize(publicUserMediasPath);
            }
        }
        
        const result = 
        {
            status: "ok",
            content: stats
        }
        response.json(result);
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

///
/// PARAMS
///

/// INFO BAR
const apiParamsInfobarGet = async function( request, response )
{
    console.log("API_PARAMS_INFOBAR_GET");
    try
    {
        const param = await AXIAL_MONGO.getData("params", {model: "info_bar"}, "info_bar");
        const result = { status: "ok", content: param };
        response.json(result);
    }
    catch(err)
    {
        console.log(err);
    }
};

const apiParamsInfobarSet = async function( request, response )
{
    try
    {
        const doc = request.body;
        const updated = await AXIAL_MONGO.setData("params", doc, "info_bar");
        response.json(BASIC_OK);
    }
    catch(err)
    {
        console.log(err);
    }
}

/// WEEK TIME - WEEK PLANNING
const apiParamsWeektimeGet = async function( request, response )
{
    console.log("API_PARAMS_WEEKTIME_GET");
    try
    {
        const param = await AXIAL_MONGO.getData("params", {model: "weektime"}, "weektime");
        const result = { status: "ok", content: param };
        response.json(result);
        //response.json(BASIC_OK);
    }
    catch(err)
    {
        console.log(err);
    }
}

const apiParamsWeektimeSet = async function( request, response )
{
    console.log("API_PARAMS_WEEKTIME_SET");
    try
    {
        const doc = request.body;
        const updated = await AXIAL_MONGO.setData("params", doc, "weektime");
        response.json(BASIC_OK);
    }
    catch(err)
    {
        console.log(err);
    }
}

///
/// SERVICES
///

const apiServicesQRCode = async function( request, response )
{
    try
    {
        const qr = request.body;
        const qrtext = qr.qrtext;
        const qroptions = 
        {
            width: qr.qrsize, 
            margin: qr.qrmargin,
            color:
            {
                dark: qr.qrcolor,
                light: qr.qrbg
            }
        }
        const qrdata = await QRCode.toDataURL( qrtext, qroptions );
        response.json( { status: "ok", qrcode: qrdata } );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
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



/**
 * Create the subscription product
 * @param {*} request 
 * @param {*} response 
 */
const apiSubscriptionsSet = async function( request, response )
{
    console.log("API_SUBSCRIPTIONS_SET");
    try
    {
        if( STRIPE_USE === false ) { throw new Error("API SUBSCRIPTION NEED STRIPE READY"); }
        let body = request.body;
        body.is_recurring = true;
        body.type = "subscription";

        const stripeObject = await AXIAL_STRIPE.setProduct( body );

        body.stripe_product_id = stripeObject.product;
        body.stripe_price_id = stripeObject.price;

        const subscription = await AXIAL_MONGO.setData("products", body, "product");
        console.log( subscription );

        response.json( BASIC_OK );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

const apiSubscriptionsGet = async function( request, response )
{
    console.log("API_SUBSCRIPTIONS_GET");
    try
    {
        if( STRIPE_USE === false ) { throw new Error("API SUBSCRIPTION NEED STRIPE READY"); }
        const localUser = response.locals.user;
        //console.log( "subscription get local user", localUser);
        //const query = request.query;
        const subscriptions = await AXIAL_MONGO.getData("products", { type: "subscription" }, "product");
        console.log(subscriptions);

        const result = 
        {
            status: "ok",
            content: subscriptions
        }

        response.json( result );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

const apiCheckoutSessionCreate = async function( request, response )
{
    console.log("API_CHECKOUT_SESSION_CREATE");
    try
    {
        if( STRIPE_USE === false ) { throw new Error("API SUBSCRIPTION NEED STRIPE READY"); }
        const priceId = request.body.stripe_price_id;
        const localUser = response.locals.user;
        const customerId = localUser.stripe_customer_id;
        
        const session = await AXIAL_STRIPE.createSession( "subscription", customerId, priceId );
        const result = 
        {
            status: "ok",
            content: session.client_secret
        }

        response.json( result );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

const apiCheckoutSessionStatus = async function( request, response )
{
    console.log("API_CHECKOUT_SESSION_STATUS");
    try
    {
        if( STRIPE_USE === false ) { throw new Error("API SUBSCRIPTION NEED STRIPE READY"); }
        const sessionId = request.query.session_id;
        const session = await AXIAL_STRIPE.stripe.checkout.sessions.retrieve(sessionId);
        const customer = await AXIAL_STRIPE.stripe.customers.retrieve(session.customer);
        const user = await AXIAL_MONGO.getData("users", {stripe_customer_id: session.customer}, "user");
        const subscription = await AXIAL_MONGO.getData("products", {stripe_product_id: user.stripe_subscription_product_id, stripe_price_id: user.stripe_subscription_price_id}, "product");
        const result = 
        {
            status: "ok",
            session: session.status,
            customer: customer,
            user: user,
            subscription: subscription
        }

        response.json( result );
    }
    catch(err)
    {
        console.log(err);
        const err_result =
        {
            status: "ko",
            error: err.message
        }
        response.json( err_result );
    }
};

///
/// STRIPE WEBHOOK
///

const apiWebhooksStripe = async function( request, response )
{
    console.log("API_STRIPE_WEBHOOK");
    let event;
    let error;
    try
    {
        if( STRIPE_USE === false ) { throw new Error("API WEBHOOK NEED STRIPE READY"); }
        if( STRIPE_WEBHOOK_SECRET )
        {
            
            const signature = request.headers['stripe-signature'];
            event = AXIAL_STRIPE.stripe.webhooks.constructEvent( request.body, signature, STRIPE_WEBHOOK_SECRET );
        }
        response.send();

        if( event )
        {
            manageStripeWebhooks(event);
        }
    }
    catch(err)
    {
        console.log(err);
        error = err;
        return response.sendStatus(400);
    }
    finally
    {
        if( error )
        {
            await AXIAL_MAILER.sendMail( "Webhook Error", "david@dndev.fr", "stripe_webhook", error );
        }
    }
};

const manageStripeWebhooks = async function( stripeEvent )
{
    if( stripeEvent === undefined || stripeEvent === null )
    {
        let error;
        error.message = "Internal error : stripe event does not exist, check Stripe Dashboard";
        await AXIAL_MAILER.sendMail( "Webhook Error", "david@dndev.fr", "stripe_webhook", error );
        return;
    }

    console.log("MANAGE_STRIPE_WEBHOOKS");

    const TYPE = stripeEvent.type;
    const DATA = stripeEvent.data.object;
    const OBJECT = {}; OBJECT.message = TYPE;
    let USER_MAIL_OBJECT = {};
    USER_MAIL_OBJECT.message = "";
    try
    {
        switch( TYPE )
        {
            case "customer.subscription.created":
                console.log("customer.subscription.created");
                const CUSTOMER = DATA.customer;
                const SUBSCRIPTION = DATA.id;
                const STATUS = DATA.status;
                const PRICE = DATA.plan.id;
                const PRODUCT = DATA.plan.product;
                const FILTER = { stripe_customer_id: CUSTOMER }
                // get the user
                const user = await AXIAL_MONGO.getData("users", FILTER, "user" );

                const UPDATE =
                {
                    _id: user._id,
                    stripe_subscription_id: SUBSCRIPTION,
                    stripe_subscription_status: STATUS,
                    stripe_subscription_price_id: PRICE,
                    stripe_subscription_product_id: PRODUCT
                }
                // update the user
                const updatedUser = await AXIAL_MONGO.setData("users", UPDATE, "user" );
                // get infos for mail
                const subscription = await AXIAL_MONGO.getData("products", {stripe_product_id: PRODUCT, stripe_price_id: PRICE}, "product");

                console.log("subscirptio", subscription);

                // update mail object
                USER_MAIL_OBJECT.product = subscription.product_name;
                USER_MAIL_OBJECT.price = subscription.price;
                USER_MAIL_OBJECT.image = AxialServerUtils.getPathFromRelative(subscription.image_main);
                USER_MAIL_OBJECT.name = user.first_name;
                USER_MAIL_OBJECT.title = "Inscription réussie !";

                const c_userMail = await AXIAL_MAILER.sendMail( "Welcome on Board!", user.email, "subscription_success", USER_MAIL_OBJECT ); 
            break;

            case "customer.subscription.deleted":
                console.log("customer.subscription.deleted");
                const D_CUSTOMER = DATA.customer;
                const D_FILTER = { stripe_customer_id: D_CUSTOMER }
                const D_STATUS = DATA.status;

                const d_user = await AXIAL_MONGO.getData("users", D_FILTER, "user" );

                const D_UPDATE =
                {
                    _id: d_user._id,
                    stripe_subscription_status: D_STATUS
                }
                // update the user
                const d_updatedUser = await AXIAL_MONGO.setData("users", D_UPDATE, "user" );
                const d_subscription = await AXIAL_MONGO.getData("products", {stripe_product_id: d_user.stripe_subscription_product_id, stripe_price_id: d_user.stripe_subscription_price_id}, "product");
                console.log("d_subscription", d_subscription)

                USER_MAIL_OBJECT.product = d_subscription.product_name;
                USER_MAIL_OBJECT.price = d_subscription.price;
                USER_MAIL_OBJECT.image = AxialServerUtils.getPathFromRelative(d_subscription.image_main);
                USER_MAIL_OBJECT.name = d_user.first_name;
                USER_MAIL_OBJECT.title = "Votre abonnement a été annulé";
                
                const d_userMail = await AXIAL_MAILER.sendMail( "Votre abonnement a été annulé", d_user.email, "subscription_deleted", USER_MAIL_OBJECT ); 
            break;

            default:
            break;
        }
    }
    catch(err)
    {
        console.log(err);
    }
    finally
    {
        // internal mail
        await AXIAL_MAILER.sendMail( "Webhook Success", "david@dndev.fr", "stripe_webhook", OBJECT );
    }
};

//const stripeWebhookSubscriptionCreatedHandler( )

///
/// PDF TEST
///

//const pdfMaker = new AxialPdfMaker();
//pdfMaker.create();

///
/// API EVENTS
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiEventSet = async function( request, response )
{
    console.log("API_EVENT_SET");
    try
    {
        const doc = request.body;
        console.log( doc )
        const eventData = await AXIAL_MONGO.setData("events", doc, "event");
        console.log(eventData);
        response.json( {status: "ok", content: eventData } );
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
//AXIAL_SERVER_APPLICATION.use( jsonRawMiddleware );
//AXIAL_SERVER_APPLICATION.use( express.json() );

AXIAL_SERVER_APPLICATION.use( (request, response, next) => 
{
    if( request.originalUrl.startsWith("/api/webhooks/stripe") )
    {
        console.log("RAW FOR STRIPE" );
        express.raw( { type: "application/json" } )(request, response, next);
    }
    else
    {
        express.json()(request, response, next);
    }
});

AXIAL_SERVER_APPLICATION.use( express.urlencoded( { extended: true } ) );
AXIAL_SERVER_APPLICATION.use( cookieParser() );

// TO TEST IMPORTANT
AXIAL_SERVER_APPLICATION.use( authMiddleware );
//AXIAL_SERVER_APPLICATION.use( authRedirectMiddleware );

// 2025 PRIVATE API
AXIAL_SERVER_APPLICATION.get( "/api/data/get", apiDataGet );
AXIAL_SERVER_APPLICATION.post( "/api/data/set", apiDataSet );
AXIAL_SERVER_APPLICATION.post( "/api/data/del", apiDataDel);

// HOME - KPI
AXIAL_SERVER_APPLICATION.get( "/api/kpi/database/get", apiKpiGetDatabase );
AXIAL_SERVER_APPLICATION.get( "/api/kpi/storage/get", apiKpiGetFileStorage );

// STATS
AXIAL_SERVER_APPLICATION.get( "/api/stats/get", apiStatsGetHandler );
AXIAL_SERVER_APPLICATION.post( "/api/stats/add", apiStatsAddHandler );

// PARAMS
AXIAL_SERVER_APPLICATION.get( "/api/params/infobar/get", apiParamsInfobarGet );
AXIAL_SERVER_APPLICATION.post( "/api/params/infobar/set", apiParamsInfobarSet );

AXIAL_SERVER_APPLICATION.get( "/api/params/weektime/get", apiParamsWeektimeGet );
AXIAL_SERVER_APPLICATION.post( "/api/params/weektime/set", apiParamsWeektimeSet );

// SERVICES
AXIAL_SERVER_APPLICATION.post( "/api/services/qrcode/", apiServicesQRCode );

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

// FILES
AXIAL_SERVER_APPLICATION.get( "/api/files/get/all", apiFilesGetAllHandler );

// PRODUCTS
AXIAL_SERVER_APPLICATION.post( "/api/products/set", apiProductsSet );

// SUBSCRIPTIONS
AXIAL_SERVER_APPLICATION.post( "/api/subscriptions/set", apiSubscriptionsSet );
AXIAL_SERVER_APPLICATION.get( "/api/subscriptions/get", apiSubscriptionsGet );

AXIAL_SERVER_APPLICATION.post( "/api/checkout/session/create", apiCheckoutSessionCreate );
AXIAL_SERVER_APPLICATION.get( "/api/checkout/session/status", apiCheckoutSessionStatus );

// STRIPE WEBHOOKS
AXIAL_SERVER_APPLICATION.post( "/api/webhooks/stripe", apiWebhooksStripe );

// EVENTS
AXIAL_SERVER_APPLICATION.post( "/api/events/set", apiEventSet );

// STATIC
AXIAL_SERVER_APPLICATION.use( "/", express.static( path.join( DIRNAME, "static" )) );
// NO DEV FOLDER
AXIAL_SERVER_APPLICATION.use( "/medias", express.static( path.join( DIRNAME, MEDIAS_FOLDER )) );
AXIAL_SERVER_APPLICATION.use( "/events", express.static( path.join( "events" )) ); // NOT NORMAL

AXIAL_SERVER_APPLICATION.use( finalMiddleware );

export default AXIAL_SERVER_APPLICATION;