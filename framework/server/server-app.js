//import dotenv from "dotenv";
//dotenv.config();

import { AxialServerErrorManager } from "./axial-server/AxialServerErrorManager.js";

import
{
    MAIN_DOMAIN,

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

    WEBSOCKET_URL,

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
} from "./axial-server/AxialServerConstants.js";

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
import http, { IncomingMessage } from "node:http";
import https from "node:https";
import path from "node:path";
import WebSocket, { WebSocketServer } from "ws";
import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";
import webpush from "web-push";
import Prelude from "@prelude.so/sdk";

import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import Stripe from "stripe";
import QRCode from "qrcode";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { AxialStripe } from "./axial-stripe/AxialStripe.js";
import { AxialServerNotificationManager } from "./axial-server/AxialServerNotificationManager.js";

const FILENAME = fileURLToPath( import.meta.url );
const DIRNAME = path.dirname(FILENAME);

const BASIC_OK = { status: "ok" };
const BASIC_KO = { status: "ko" };

// dev
const PORT = 2383;
const MESSAGING_SOCKET_URL = `ws://localhost:${PORT}/ws`;
const VAPID_PUBLIC_KEY = "";
const VAPID_PRIVATE_KEY = "";
const PRELUDE_API_TOKEN = "";

// prod
/*
const PORT = 3000;
const MESSAGING_SOCKET_URL = "wss://srflow.fr/ws";
const VAPID_PUBLIC_KEY = "";
const VAPID_PRIVATE_KEY = "";
const PRELUDE_API_TOKEN = "";
*/

const MESSAGING_RULES = new Map();
MESSAGING_RULES.set( "user",  { allow_to: [ { role: "admin", view_as: "group", copy_to: [], display_as: "TO DISPLAY" } ] } );
MESSAGING_RULES.set( "admin", { allow_to: [ { role: "user",  view_as: "single", copy_to: [ "admin" ], display_as:"user" } ] } );

/*
const CORS_OPTIONS =
{
    origin: [ "http://localhost", "https://localhost", "http://localhost:3000", "https://localhost:3000", "http://localhost:8080", "https://localhost:8080", "http://localhost:8081", "https://localhost:8081" ],
    credentials: true,
    optionsSuccessStatus: 200 // Pour certains navigateurs anciens
};
*/

const multerUploader = multer();
const preludeClient = new Prelude( { apiToken: PRELUDE_API_TOKEN } );

webpush.setVapidDetails("mailto:david@dndev.fr", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

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

const ASEM = new AxialServerErrorManager();
AxialServerErrorManager.mongo = AXIAL_MONGO;
AxialServerErrorManager.mailer = AXIAL_MAILER;

const AXIAL_NOTIFICATION_MANAGER = new AxialServerNotificationManager();
AxialServerNotificationManager.mongo = AXIAL_MONGO;

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
    //console.log(requestedPath);
    const isAPI = requestedPath.indexOf("/api/") === 0;
    //console.log( isAPI );

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

    //console.log("authRequired", authRequired);
    
    if( authRequired === false && isSpecialPath === false )
    {
        next();
        return;
    }
    
    /// AUTH REQUIRED TRUE HERE
    // check now if user is already connected
    const token = request.cookies.axial_auth_jwt;
    //console.log(token);

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
            //console.log(user);
            
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
                        if( pathToCheck.permission !== role && pathToCheck.permission === "all" )
                        {
                            //response.redirect("/");
                            next();
                        }
                        else if( role === pathToCheck.permission )
                        {
                            next();
                        }
                        else
                        {
                            //next();
                            response.redirect("/");
                        }
                    }
                    else
                    {
                        // check api role here
                        //console.log("test important keep todo");
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
    console.log("API_AUTH_CODE_SEND");
    try
    {
        const body = request.body;
        const verifType = String(body.method);
        const user = response.locals.user;
        // WW
        const tempCode = AxialServerUtils.getVerificationCode();
        //console.log( tempCode );
        const decryptedEmail = AxialCryptoUtils.decrypt( user.email );
        const timeResult = await AXIAL_MONGO.setTimeCode( tempCode, user.email );

        const decryptedTel = AxialCryptoUtils.decrypt( user.tel );
        const realTel = "+33" + decryptedTel.substring(1);

        let result;
        const recipient = verifType === "sms" ? decryptedTel : decryptedEmail;

        if( verifType === "sms" )
        {
            const prelude_object = 
            {
                target:
                {
                    type:"phone_number",
                    value: realTel
                }
            };
            const verification = await preludeClient.verification.create( prelude_object );
            console.log( verification.id );
            
        }
        else if( verifType === "email" )
        {
            result = await AXIAL_MAILER.sendMail( "Votre code de vérification", decryptedEmail, "sendcode", { code: tempCode } );
        }
        console.log( verifType, result );
        response.json( { status: "ok", recipient: recipient } );
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
    console.log("API_AUTH_CODE_VERIFY");
    try
    {
        const user = response.locals.user;
        const code = request.body.code;
        const method = String(request.body.method);
        let verified = false;
        if( method === "sms" )
        {
            const decryptedTel = AxialCryptoUtils.decrypt( user.tel );
            const realTel = "+33" + decryptedTel.substring(1);
            const sms_object = 
            {
                target: { type: "phone_number", value: realTel }, code: code
            };
            const smsCheck = await preludeClient.verification.check( sms_object );
            if( smsCheck.status && smsCheck.status == "success" )
            {
                verified = true;
            }
        }
        else if( method === "email" )
        {
            const timeFilter = { timecode: code, timechecker: user.email };
            const timeResult = await AXIAL_MONGO.getData("codes", timeFilter);

            if( timeResult === null || ( Array.isArray(timeResult) === true && timeResult.length === 0 ) )
            {
                verified = false;
            }
            else
            {
                verified = true;
            }
        }
        else
        {
            response.json(BASIC_KO);
            return;
        }

        if( verified === true )
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
    console.log("API_AUTH_SIGNUP");
    let body = request.body;
    const email = body.email;
    const pass = body.password;
    try
    {
        const encryptedEmail = AxialCryptoUtils.encrypt( email );
        const possibleUsers = await AXIAL_MONGO.getData("users", { model: "user", email: encryptedEmail } );
        //console.log( possibleUsers );
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
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiAuthEmailCheckHandler = async function( request, response )
{
    //console.log("check email server");
    let body = request.body;
    const email = body.email;
    try
    {
        //const encryptedEmail = AxialCryptoUtils.encrypt( email );
        const possibleUsers = await AXIAL_MONGO.getData("users", { email: email }, "user_base" );
        //console.log( "mail checker", possibleUsers );
        if( possibleUsers === null )
        {
            response.json( { status: "ok", exists: false } );
        }
        else
        {
            response.json( { status: "ok", exists: true } );
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

/**
 * POST
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiAuthPasswordRequestHandler = async function( request, response )
{
    console.log("API_PASSWORD_REQUEST");
    try
    {
        const body = request.body;
        const email = body.email;
        // WW
        const user = await AXIAL_MONGO.getData("users", { email: email}, "user_base");
        console.log(user);
        const tempCode = AxialServerUtils.getVerificationCode();
        const timeResult = await AXIAL_MONGO.setTimeCode( tempCode, user.email );
        console.log(timeResult);
        const emailObject = 
        {
            title: "Demande de changement de mot de passe",
            name: user.first_name,
            code: tempCode
        }
        const sentEmail = await AXIAL_MAILER.sendMail("Demande de changement de mot de passe", email, "password_change_request", emailObject);
        
        response.json(BASIC_OK);
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
const apiAuthPasswordChangeHandler = async function( request, response )
{
    console.log("API_PASSWORD_CHANGE");
    try
    {
        const body = request.body;
        const email = body.email;
        const code = body.code;
        const password = body.password;
        // WW
        const user = await AXIAL_MONGO.getData("users", { email: email }, "user_base");
        if( user === null )
        {
            response.json( { status: "ko", message:"Une erreur inconnue s'est produite et votre mot de passe n'a pu être changé. Contactez le support." } );
            return;
        }

        const timeFilter = { timecode: code, timechecker: email };
        const timeResult = await AXIAL_MONGO.getData("codes", timeFilter);

        if( timeResult === null || ( Array.isArray(timeResult) === true && timeResult.length === 0 ) )
        {
            response.json( { status: "ko", message:"Le code d'identification n'est pas valide. Votre mot de passe n'a pas été modifié. Veuillez essayer à nouveau." } );
            return;
        }
        
        const model = user.model;
        const passModified = await AXIAL_MONGO.setData( "users", { _id:user._id, password: password }, model );

        response.json( { status: "ok", message: "Votre mot de passe a bien été modifié. Vous allez être redirigé vers l'accueil." } );
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

/**
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
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

/**
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiDataSet = async function( request, response )
{
    console.log("API_SET_DATA");
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

/**
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiDataDel = async function( request, response )
{
    console.log("API_DATA_DEL");
    try
    {
        const doc = request.body;
        const collection = doc.collection;
        const _id = doc._id;
        const deletion = await AXIAL_MONGO.delData(collection, _id);
        const result = { status: "ok", content: deletion };
        response.json( result );
    }
    catch( err )
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiDataArchive = async function( request, response )
{
    console.log("API_DATA_ARCHIVE");
    try
    {
        const doc = request.body;
        const collection = doc.collection;
        const _id = doc._id;
        const archive = await AXIAL_MONGO.archiveData( collection, _id );
        const result = { status: "ok", content: archive };
        response.json( result );
    }
    catch( err )
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiDataClone = async function( request, response )
{
    console.log("API_DATA_Clone");
    try
    {
        const doc = request.body;
        const collection = doc.collection;
        const _id = doc._id;
        const clone = await AXIAL_MONGO.cloneData( collection, _id );
        const result = { status: "ok", content: clone };
        response.json( result );
    }
    catch( err )
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

///
/// USER PART (for admin)
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiUserList = async function( request, response )
{
    console.log("API_USER_LIST");
    try
    {
        const localUser = response.locals.user;
        if( localUser.role !== "admin" )
        {
            response.JSON(BASIC_KO);
        }

        let tempUsers = new Array();
        console.log(tempUsers)
        let finalUsers = new Array();

        const users = await AXIAL_MONGO.getData("users", { model: "user", role: "user" }, "user" );
        console.log( users )
        if( users !== null )
        {
            
            if( Array.isArray( users ) === false ) { tempUsers.push(users); } else { tempUsers = users; }
        }

        for( let tu of tempUsers )
        {
            // get the projects
            let userProjects = new Array();
            const possibleUserProjects  = await AXIAL_MONGO.getData("projects", { model:"project", created_for: tu.uuid } );
            if( possibleUserProjects !== null )
            {
                if( Array.isArray( possibleUserProjects) === false ) { userProjects.push(possibleUserProjects); } else { userProjects = possibleUserProjects; }
                for( let project of userProjects )
                {
                    let simulationsData = new Array();
                    const simulationsIds = project.simulations;
                    for( const simId of simulationsIds )
                    {
                        let sim = await AXIAL_MONGO.getData( "projects", { _id: simId, archived: false }, "simulation" );
                        if( sim !== null )
                        {
                            simulationsData.push(sim);
                        }
                    }
                    project.simulations_data = simulationsData;
                }

            }
            tu.projects_data = userProjects;
        }

        response.json( {status: "ok", content: tempUsers } );
    }
    catch(err)
    {
        console.log( err );
        response.JSON(BASIC_KO);
    }

}

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiUserCreate = async function( request, response )
{
    console.log("API_USER_CREATE");
    try
    {
        const body = request.body;
        //console.log(body);
        const localUser = response.locals.user;
        if( localUser.role !== "admin" )
        {
            response.JSON( { status: "ko", error: "Unauthorized" });
            return;
        }

        // validate body
        // imlportant todo : validate email and phone

        const userInserted = await AXIAL_MONGO.setData("users", body, "user");
        console.log("user inserted",userInserted);

        response.json( {status: "ok", content: "" } );
    }
    catch(err)
    {
        console.log(err.message)
        let koObject = { status: "ko", error: "unknow error" };
        if( err.message.indexOf("duplicate") >= 0 )
        {
            koObject.error = "duplicate_mail";
        }
        response.json( koObject );
    }
}

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiUserUpdate = async function( request, response )
{
    console.log("API_USER_UPDATE");
    try
    {
        const body = request.body;
        const localUser = response.locals.user;
        /*
        if( localUser.role !== "admin" )
        {
            response.JSON(BASIC_KO);
        }
        */
        // if rolr == user -> check that we have same uuid in local user

        const userModified = await AXIAL_MONGO.setData("users", body, "user");
        console.log(userModified);

        response.json( {status: "ok", content: "" } );
    }
    catch(err)
    {
        console.log( err );
        response.JSON(BASIC_KO);
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiUserGet = async function( request, response )
{
    console.log("API_USER_GET");
    try
    {
        const localUser = response.locals.user;
        const fullUser = await AXIAL_MONGO.getData("users", { role: localUser.role, _id: localUser._id}, localUser.model );
        response.json( {status: "ok", content: fullUser } );
    }
    catch(err)
    {
        console.log( err );
        response.JSON(BASIC_KO);
    }
};

const apiUserInfoGet = async function( request, response )
{
    console.log("API_USER_GET_UUID");
    try
    {
        const localUser = response.locals.user;
        //console.log( localUser );
        if( localUser && localUser.role && localUser.role == "admin" )
        {
            const q = request.query;
            const uuid = q.u;
            const fullUser = await AXIAL_MONGO.getData("users", { uuid: uuid }, "user" );
            if( fullUser != null )
            {
                response.json( {status:"ok", content: fullUser} );
            }
            
        }
        else
        {
            response.json( { status: "ko", content: "permission_denied" } );
        }
    }
    catch(err)
    {
        console.log( err );
        response.JSON(BASIC_KO);
    }
};

///
/// ONBOARDING
///

const apiOnboardingContact = async function( request, response )
{
    console.log("API_OnboardingContact");
    try
    {
        const localUser = response.locals.user;
        if( localUser.role !== "admin" )
        {
            response.JSON(BASIC_KO);
        }
        const admin = await AXIAL_MONGO.getData("users", {_id:localUser._id}, "admin");

        const body = request.body;
        const tel = body.tel;
        // test the tel length and so on
        const preludeObject = 
        {
            template_id: "template_01kz6bf49xfxbrn3etd3d2wdn8",
            to: tel,
            variables: { admin_name: admin.first_name }
        }
        const preludeTransational = await preludeClient.notify.send( preludeObject );

        response.json( {status: "ok", content: "" } );
    }
    catch(err)
    {
        console.log( err );
        response.JSON(BASIC_KO);
    }
}

///
/// PRODUCT PART
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiProductList = async function( request, response )
{
    console.log("API_PRODUCT_LIST");
    try
    {
        const localUser = response.locals.user;
        /*
        if( localUser.role !== "admin" )
        {
            response.JSON(BASIC_KO);
            return;
        }
        */

        let finalProducts = new Array();

        const tempProducts = await AXIAL_MONGO.getData("products", { model: "product" }, "product" );
        if( tempProducts !== null )
        {
            if( Array.isArray( tempProducts ) === false ) { finalProducts.push(tempProducts); } else { finalProducts = tempProducts; }
        }

        response.json( {status: "ok", content: finalProducts } );
    }
    catch(err)
    {
        console.log( err );
        response.JSON(BASIC_KO);
    }
}

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiProductCreate = async function( request, response )
{
    console.log("API_PRODUCT_CREATE");
    try
    {
        const body = request.body;
        console.log(body);
        const localUser = response.locals.user;
        /// TO CHANGE REGARDING ROUTES AND PERMISSIONS
        if( localUser.role !== "admin" )
        {
            response.JSON(BASIC_KO);
            return;
        }

        // validate body
        // imlportant todo : validate email and phone

        const userInserted = await AXIAL_MONGO.setData("products", body, "product");
        console.log(userInserted);

        response.json( {status: "ok", content: "" } );
    }
    catch(err)
    {
        console.log( err );
        response.JSON(BASIC_KO);
    }
}

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiProductUpdate = async function( request, response )
{
    console.log("API_PRODUCT_UPDATE");
    try
    {
        const body = request.body;
        const localUser = response.locals.user;
        
        if( localUser.role !== "admin" )
        {
            response.JSON(BASIC_KO);
        }
        
        // if rolr == user -> check that we have same uuid in local user

        const productModified = await AXIAL_MONGO.setData("products", body, "product");
        //console.log(userModified);

        response.json( {status: "ok", content: "" } );
    }
    catch(err)
    {
        console.log( err );
        response.JSON(BASIC_KO);
    }
}

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
    console.log("API_STATS");
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
    console.log("API_MEDIA_UPLOAD_HANDLER");
    try
    {
        // auth middleware
        const user = response.locals.user;
        const role = user.role;
        const pathKey = role == "admin" ? user.group_id : user.uuid;
        // multer
        const upFile = request.file;
        const fileName = upFile.originalname;
        const fileData = upFile.buffer;

        //const filePublic = Boolean( Number( request.get("axial_filepublic") ) );
        
        /// ALWAYS PUBLIC AT THE MOMENT
        
        const finalFileName = String( Date.now() ) + "_____" + fileName;

        // check if directory exists and if it is accessible
        const mediasPath = path.join( DIRNAME, MEDIAS_FOLDER );
        const userMediasPath = path.join(mediasPath, pathKey);
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
        const relativeFilePath = `./${MEDIAS_FOLDER}/${pathKey}/${finalFileName}`;
        
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

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiUploadFilePostHandler = async function( request, response )
{
    console.log( "API_FILE_UPLOAD");
    try
    {
        const user = response.locals.user;
        // multer
        const upFile = request.file;
        //console.log(upFile);
        const fileName = upFile.originalname;
        const fileData = upFile.buffer;
        const fileMime = upFile.mimetype;
        const fileSize = upFile.size;

        // doc pour mongo
        const fileDoc = 
        {
            original_name: fileName,
            data: fileData,
            mimetype: fileMime,
            size: fileSize
        }

        const result = await AXIAL_MONGO.setData( "files", fileDoc, "file_model_base" );
        //console.log( result );

        // on renvoit l'id inséré
        response.json( { status: "ok", id: result.insertedId } );
        
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
}
/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiUploadFileGetHandler = async function( request, response )
{
    try
    {
        console.log( "API_FILE_GET");
        const id = request.params.id;
        const downloadQuery = Number(request.query.d) === 1 ? true : false;
        const fileObject = await AXIAL_MONGO.getData( "files", { model: "file_model_base", _id:id }, "file_model_base" );
        //console.log( fileObject );
        if( fileObject == null )
        {
            return response.status(404).json( { message: "404 file" });
        }
        const fileBuffer = Buffer.from(fileObject.data.buffer);
        
        //response.setHeader('Content-Type', fileObject.mimetype);
        //response.send(fileObject.data);
        //.attachment(fileObject.original_name)
        return response
            .status(200)
            .type(fileObject.mimetype)
            .set('Content-Length', fileBuffer.length)
            .send(fileBuffer);
    }
    catch(err)
    {
        console.log(err)
        response.json( BASIC_KO );
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

/// mentions légales estimation
const apiParamsEstimationLegalGet = async function( request, response )
{
    console.log("API_PARAMS_ESTIMATION_LEGAL_GET");
    try
    {
        const param = await AXIAL_MONGO.getData("params", { name: "estimation_legal" } );
        const result = { status: "ok", content: param };
        console.log(result);
        response.json(result);
    }
    catch(err)
    {
        console.log(err);
    }
}

const apiParamsEstimationLegalSet = async function( request, response )
{
    console.log("API_PARAMS_ESTIMATION_LEGAL_SET");
    try
    {
        const doc = request.body;
        console.log( doc )
        const updated = await AXIAL_MONGO.setData("params", doc);
        console.log(updated);
        response.json(BASIC_OK);
    }
    catch(err)
    {
        console.log(err);
    }
}

/// address estimation
const apiParamsEstimationAddressGet = async function( request, response )
{
    console.log("API_PARAMS_ESTIMATION_ADDRESS_GET");
    try
    {
        const param = await AXIAL_MONGO.getData("params", { name: "estimation_address" } );
        const result = { status: "ok", content: param };
        console.log(result);
        response.json(result);
    }
    catch(err)
    {
        console.log(err);
    }
}

const apiParamsEstimationAddressSet = async function( request, response )
{
    console.log("API_PARAMS_ESTIMATION_ADDRESS_SET");
    try
    {
        const doc = request.body;
        console.log( doc )
        const updated = await AXIAL_MONGO.setData("params", doc);
        console.log(updated);
        response.json(BASIC_OK);
    }
    catch(err)
    {
        console.log(err);
    }
}


/// Mail destinataires
const apiParamsEstimationMailGet = async function( request, response )
{
    console.log("API_PARAMS_ESTIMATION_MAIL_GET");
    try
    {
        const param = await AXIAL_MONGO.getData("params", { name: "estimation_mail" } );
        const result = { status: "ok", content: param };
        console.log(result);
        response.json(result);
    }
    catch(err)
    {
        console.log(err);
    }
}

const apiParamsEstimationMailSet = async function( request, response )
{
    console.log("API_PARAMS_ESTIMATION_MAIL_SET");
    try
    {
        const doc = request.body;
        console.log( doc )
        const updated = await AXIAL_MONGO.setData("params", doc);
        console.log(updated);
        response.json(BASIC_OK);
    }
    catch(err)
    {
        console.log(err);
    }
}

/**
 * Image we display on a quote or simulation / estimation
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiParamsEstimationImageGet = async function( request, response )
{
    console.log("API_PARAMS_ESTIMATION_IMAGE_GET");
    try
    {
        const param = await AXIAL_MONGO.getData("params", { name: "estimation_image" } );
        const result = { status: "ok", content: param };
        console.log(result);
        response.json(result);
    }
    catch(err)
    {
        console.log(err);
    }
}

/**
 * Image we display on a quote or simulation / estimation
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiParamsEstimationImageSet = async function( request, response )
{
    console.log("API_PARAMS_ESTIMATION_IMAGE_SET");
    try
    {
        const doc = request.body;
        console.log( doc )
        const updated = await AXIAL_MONGO.setData("params", doc);
        console.log(updated);
        response.json(BASIC_OK);
    }
    catch(err)
    {
        console.log(err);
    }
}


/**
 * Set the Opens Hours / Time Shift / of the company
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiParamsCompanyTimeShiftGet = async function( request, response )
{
    console.log("API_PARAMS_COMPANY_TIMESHIFT_GET");
    try
    {
        const param = await AXIAL_MONGO.getData("params", { name: "company_timeshift" } );
        const result = { status: "ok", content: param };
        console.log(result);
        response.json(result);
    }
    catch(err)
    {
        console.log(err);
    }
}

/**
 * Set the Opens Hours / Time Shift / of the company
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiParamsCompanyTimeShiftSet = async function( request, response )
{
    console.log("API_PARAMS_COMPANY_TIMESHIFT_SET");
    try
    {
        const doc = request.body;
        console.log( doc )
        const updated = await AXIAL_MONGO.setData("params", doc);
        console.log(updated);
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

/**
 * Create a produt and inject it to stripe
 * @deprecated
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
 
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
/// PUSH
///

const apiPushSubscribe = async function( request, response )
{
    let message = "";
    try
    {
        const doc = request.body;
        const alreadyExist = await AXIAL_MONGO.getData( "notifications", { user_id: doc.user_id }, "notif_subscription" );
        //console.log( alreadyExist );

        if( alreadyExist === null )
        {
            const result = await AXIAL_MONGO.setData( "notifications", doc, "notif_subscription" );
            console.log( result );
            message = "subscription_registered";
        }
        else
        {
            message = "subscription_exists";
        }

        
        response.json( { status: "ok", message: message } );

    }
    catch(err)
    {
        console.log(err);
        message = "subscription_error"
        response.json( { status: "ko", message: message } );
    }
};

const apiPushUnsubscribe = async function( request, response )
{
    console.log("API_PUSH_UNSUBSCRIBE");
    try
    {
        const localUser = response.locals.user;
        const id = localUser._id.toString();
        const subscription = await AXIAL_MONGO.getData("notifications", { user_id: id }, "notif_subscription");
        if( subscription )
        {
            const subscriptionId = subscription._id.toString();
            const deletion = await AXIAL_MONGO.delData("notifications", subscriptionId );
            //console.log(deletion);
        }

        response.json( BASIC_OK );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

const apiPushSend = async function( request, response )
{
    console.log("API_PUSH_SEND");
    try
    {
        const localUser = response.locals.user;
        //console.log( localUser)
        const role = localUser.role;
        //console.log( role )
        if( role !== "admin" )
        {
            response.json( { status: "ko", content: "Unauthorized" } );
            return;
        }
        //console.log( "try")

        const payload = request.body;
        //console.log( payload )
        const users = await AXIAL_MONGO.getData("users", { model: "user" }, "user");
        //console.log( users )
        let ids = [];
        if( users !== null )
        {
            if( Array.isArray( users ) === true )
            {
                for( const user of users )
                {
                    ids.push( user._id.toString() );
                }
            }
            else
            {
                ids.push( users._id.toString() );
            }
        }
        //console.log( ids );

        const notif = await AxialServerNotificationManager.sendNotification( payload.title, payload.message, ids );
        response.json( BASIC_OK );

    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

const apiPushVapid = async function( request, response )
{
    try
    {   
        response.json( {status: "ok", key: VAPID_PUBLIC_KEY } );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

///
/// PROJECTS
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiProjectsCreate = async function( request, response )
{
    console.log("API_PROJECT_CREATE");
    try
    {
        // we need the uuid of the user that is not necessary the one of the logged person
        const doc = request.body;
        const projectName = doc?.project_name || "Nouveau projet";

        const simulationName = projectName; //doc?.simulation_name || "Estimation 1";
        
        const createdFor = doc?.created_for || undefined;
        const localUser = response.locals.user;
        console.log(localUser);
        let projectData = {};

        const projectId = crypto.randomUUID();

        const simulation = await AXIAL_MONGO.setData( "projects", { project_id:projectId, simulation_name: simulationName, user_uuid: localUser.uuid, created_for: createdFor } , "simulation" );
        console.log( simulation );
        if( simulation?.acknowledged === true )
        {
            const project = await AXIAL_MONGO.setData( "projects", { project_name: projectName, simulations: [simulation.insertedId.toString()], user_uuid: localUser.uuid, uuid: projectId, created_for: createdFor } ,"project" );
            console.log( project );
            projectData = await AXIAL_MONGO.getData( "projects", { _id: project.insertedId.toString() }, "project" );
            response.json( { status: "ok", content: projectData } );
        }
        else
        {
            response.json( BASIC_KO );
        }
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiProjectsGet = async function( request, response )
{
    console.log("API_PROJECTS_GET");
    try
    {
        const uuid = request.query.cf;
        console.log(uuid);
        if( uuid )
        {
            let projects = [];
            let projectsData = await AXIAL_MONGO.getData( "projects", { created_for: uuid, model: "project", archived: false } );
            //console.log( projectsData );
            if( projectsData !== null )
            {
                if( Array.isArray( projectsData ) === false )
                {
                    projects.push(projectsData);
                }
                else
                {
                    projects = projectsData;
                }

                for( let project of projects )
                {
                    let simulationsData = new Array();
                    const simulationsIds = project.simulations;
                    for( const simId of simulationsIds )
                    {
                        let sim = await AXIAL_MONGO.getData( "projects", { _id: simId, archived: false }, "simulation" );
                        if( sim !== null )
                        {
                            simulationsData.push(sim);
                        }
                    }
                    project.simulations_data = simulationsData;
                }

            }
            console.log(projectsData);
            response.json( { status: "ok", content: projects } );
        }
        else
        {
            response.json( BASIC_KO );
        }
        
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiProjectsUpdate = async function( request, response )
{
    console.log("API_PROJECTS_UPDATE");
    try
    {
        const projectData = request.body;
        const update = await AXIAL_MONGO.setData( "projects", projectData ,"project" );
        response.json( BASIC_OK );

    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiProjectsHas = async function( request, response )
{
    console.log("API_PROJECTS_HAS");
    try
    {
        const localUser = response.locals.user;
        let projectsCount = 0;
        if( localUser.role !== "user" )
        {
            response.json( BASIC_KO );
            return;
        }
        const uuid = localUser.uuid;
        
        const projects = await AXIAL_MONGO.getData( "projects", {created_for: uuid, model:"simulation"} );
        console.log( projects );
        if( projects !== null )
        {
            if( Array.isArray(projects) === true )
            {
                projectsCount = projects.length;
            }
            else
            {
                projectsCount = 1;
            }
        }

        response.json( { status: "ok", content: projectsCount } );

    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiProjectsDelete = async function( request, response )
{
    console.log("API_PROJECTS_DELETE");
    try
    {
        response.json( BASIC_OK );

    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiSimulationGet = async function( request, response )
{
    console.log("API_SIMULATION_GET");
    try
    {
        const simid = request.query.simid;
        if( simid )
        {
            const simulation = await AXIAL_MONGO.getData( "projects", { _id: simid, model: "simulation" } );
            response.json( { status: "ok", content: simulation } );
        }
        else
        {
            response.json( { BASIC_KO } );
        }
        
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiSimulationUpdate = async function( request, response )
{
    console.log("API_SIMULATION_UPDATE");
    try
    {
        const simulationData = request.body;
        console.log(simulationData);
        const update = await AXIAL_MONGO.setData( "projects", simulationData ,"simulation" );
        console.log(update);
        response.json( BASIC_OK );
        
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * Clone the simulation and add it to its project. New _id
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiSimulationDelete = async function( request, response )
{
    console.log("API_SIMULATION_DEL");
    try
    {
        const body = request.body;
        const simulationId = body._id;
        const simulation = await AXIAL_MONGO.getData("projects", { _id: simulationId }, "simulation" );

        let project = await AXIAL_MONGO.getData("projects", { uuid: simulation.project_id }, "project" );
        let projectSimulations = project.simulations;
        const simIndex = projectSimulations.indexOf(simulationId);
        projectSimulations.splice(simIndex, 1);
        project.simulations = projectSimulations;
        const projectUpdated = await AXIAL_MONGO.setData("projects", project, "project");
        const simulationDeleted = await AXIAL_MONGO.delData("projects", simulationId);
        console.log(simulationDeleted);
        response.json( BASIC_OK );
        
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * Remove the simulation from the database and update its project.simulation array
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiSimulationClone = async function( request, response )
{
    console.log("API_SIMULATION_CLONE");
    try
    {
        const localUser = response.locals.user;
        const body = request.body;
        const simulationId = body._id;
        
        // get sim
        const simulation = await AXIAL_MONGO.getData("projects", { _id: simulationId }, "simulation" );
        console.log("simulation to clone", simulation);
        
        // clone it
        let simClone = { ...simulation };
        delete simClone._id;
        delete simClone.creation_date;
        delete simClone.uuid;

        simClone.simulation_name = simClone.simulation_name + " (Copy)";
        simClone.user_uuid = localUser.uuid;

        const simulationCloned = await AXIAL_MONGO.setData("projects", simClone, "simulation" );

        let project = await AXIAL_MONGO.getData("projects", { uuid: simulation.project_id }, "project" );
        console.log(project);
        project.simulations.push(simulationCloned.insertedId);

        const projectUpdated = await AXIAL_MONGO.setData("projects", project, "project");
        console.log( projectUpdated)

        response.json( BASIC_OK );
        
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

///
/// CONVERSATIONS
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiConversationCreate = async function( request, response )
{
    console.log("API_CONVERSATION_CREATE");
    try
    {
        const localUser = response.locals.user;
        const localRole = localUser.role;
        //console.log( localUser );
        const body = request.body;
        //console.log( body );

        let conversation = body;

        conversation.users = new Array();
        conversation.admins = new Array();

        // quelque soit la conversation, tous les admins sont là
        const admins = await AXIAL_MONGO.getData( "users", { role: "admin"}, "admin" );
        if( admins === null )
        {
            // pas d'admin ---> erreur
            response.json( BASIC_KO );
            return;
        }
        else if( Array.isArray(admins) === true )
        {
            for( const admin of admins )
            {
                conversation.admins.push( admin.uuid );
            }
        }
        else
        {
            conversation.admins.push( admins.uuid );
        }
        
        if( localRole === "user" )
        {
            if( localUser.uuid === conversation.from )
            {
                // c'est bien le bon user, on l'ajoute à l'array
                conversation.users.push( conversation.from );
                
            }
            else
            {
                response.json( BASIC_KO );
                return
            }
        }
        else if( localRole === "admin" )
        {
            // on regarde le to qui doit être un user unique
            const uniqueUser = await AXIAL_MONGO.getData("users", { uuid: conversation.to[0], model: "user" }, "user" );
            if( uniqueUser )
            {
                conversation.users.push(uniqueUser.uuid);
            }
        }
        else
        {
            // pas de bon role
            response.json( BASIC_KO );
            return;
        }
            
        //console.log( conversation );
        
        //response.json( { status: "ok" } );
        
        const inserted = await AXIAL_MONGO.setData("messages", conversation, "conversation");
        const _id = inserted.insertedId.toHexString()
        const conversationCreated = await AXIAL_MONGO.getData("messages", { _id: _id } );
        response.json( { status: "ok", content: conversationCreated } );
        

    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiConversationGet = async function( request, response )
{
    try
    {
        
        response.json( BASIC_OK );

    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiConversationList = async function( request, response )
{
    console.log("API_CONVERSATION_LIST");
    try
    {
        const query = request.query;
        //console.log(query);
        
        const localUser = response.locals.user;
        const localRole = localUser.role;
        const uuid = localUser.uuid;
        let conversations = new Array();
        let finalConversations = new Array();

        const tempConversations = await AXIAL_MONGO.getData( "messages",  { model:"conversation" }, "conversation" );
        
        if( tempConversations !== null )
        {
            if( Array.isArray(tempConversations) === true )
            {
                conversations = tempConversations;
            }
            else
            {
                conversations.push( tempConversations );
            }
        }

        if( localRole === "user" )
        {
            for( const conv of conversations )
            {
                const all = conv.users.concat( conv.admins );
                //console.log(all)
                if( all.indexOf( uuid ) >= 0 )
                {
                    finalConversations.push( conv );
                }
            }
        }
        else
        {
            finalConversations = conversations;
        }
        
        
        //console.log( finalConversations );
        response.json( { status: "ok", content: finalConversations } );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiConversationContacts = async function( request, response )
{
    console.log("API_CONVERSATION_CONTACTS");
    try
    {
        const localUser = response.locals.user;
        const uuid = localUser.uuid;
        const role = localUser.role;

        const messagingRule = MESSAGING_RULES.get( role ).allow_to;
        let contacts = new Array();
        for( const mr of messagingRule )
        {
            const arole = mr.role;
            const vas = mr.view_as;
            if( vas === "group" )
            {
                let uuids = new Array();
                const group = await AXIAL_MONGO.getData( "users", { role: arole }, "user_base" );
                //console.log( group );
                if( group === null ) { continue; }
                if( Array.isArray(group) === true )
                {
                    for( const u of group )
                    {
                        uuids.push( u.uuid );
                    }
                }
                else
                {
                    uuids.push( group.uuid );
                }
                contacts.push( { label: mr.display_as, role: arole, uuids: uuids } );
            }
            else if( vas === "single" )
            {
                const group = await AXIAL_MONGO.getData( "users", { role: arole }, "user_base" );
                let uuids = new Array();
                if( group === null ) { continue; }
                if( Array.isArray(group) === true )
                {
                    for( const u of group )
                    {
                        contacts.push( { label: `${u.first_name} ${u.last_name}`, role: arole, uuids: new Array( u.uuid ) } );
                    }
                }
                else
                {
                    //uuids.push( group.uuid );
                    contacts.push( { label: `${group.first_name} ${group.last_name}`, uuids: new Array( group.uuid ) } );
                }
            }
            
        }
        response.json( { status: "ok", content: contacts } );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};


/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiConversationDelete = async function( request, response )
{
    try
    {
        
        response.json( BASIC_OK );

    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiMessageGet = async function( request, response )
{
    console.log("API_MESSAGE_GET");
    try
    {
        const convUuid = request.query.c;
        //console.log( convUuid );
        const messages = await AXIAL_MONGO.getData( "messages", { model: "message", conversation_id: convUuid }, "message" );
        //console.log( messages );
        let array = new Array();
        if( messages !== null )
        {
            if( Array.isArray(messages) ) { array = messages; }
            else { array.push( messages ); }
        }
        response.json( { status: "ok", content: array } );

    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiMessageCreate = async function( request, response )
{
    console.log("API_MESSAGE_CREATE");
    try
    {
        const localUser = response.locals.user;
        const uuid = localUser.uuid;
        const role = localUser.role;

        const body = request.body;
        //console.log( body );
        // on enregistre d'abord le message qui est prioritaire
        const inserted = await AXIAL_MONGO.setData("messages", body, "message" );

        let finalAdmins = [];
        let finalUsers = [];

        // get admins
        const admins = await AXIAL_MONGO.getData( "users", { model: "admin" }, "admin" );
        if( admins !== null )
        {
            if( Array.isArray( admins ) === true )
            {
                for( const admin of admins )
                {
                    finalAdmins.push( admin._id.toString() );
                }
            }
            else
            {
                finalAdmins.push( admins._id.toString() );
            }
        }

        // get the user
        const conversation = await AXIAL_MONGO.getData("messages", { model: "conversation", uuid: body.conversation_id }, "conversation" );
        const userUuid = conversation.users[0]
        const user = await AXIAL_MONGO.getData( "users", { uuid: userUuid, model: "user" }, "user" );
        finalUsers.push( user._id.toString() );

        //console.log("finalUsers", finalUsers)
        //console.log("finalAdmins", finalAdmins)
        //console.log("ROLE NOTIF", role);

        if( role === "admin" )
        {
            // send notif to user -> consider the case we need to send a notification to others admins
            await AxialServerNotificationManager.sendNotification( "Nouveau message", "RDV sur Estinnov pour consulter votre nouveau message", finalUsers );
        }
        else if( role === "user" )
        {
            const userTitle = `Nouveau message de ${user.first_name} ${user.last_name}`
            await AxialServerNotificationManager.sendNotification( userTitle, body.content, finalAdmins );
        }

        // on get la conversation pour récupérer le user cible
    

        response.json( BASIC_OK );

    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

///
/// BOOKINGS
///

const apiBookingData = async function( request, response )
{
    console.log("API_BOOKING_DATA");
    try
    {
        const user = request.locals.user;
        if( user == undefined || user == null )
        {
            response.json( {status: "ko" } );
            return;
        }
        
        let bookingData = {};
        const role = user.role;
        if( role === "admin" )
        {

        }
        else if( role == "user" )
        {

        }
        else
        {
            // oupsy
            response.json( {status: "ko" } );
            return;
        }
    }
    catch(err)
    {
        
        response.json( {status: "ko" } );
        return;
    }
};

const apiBookingCreate = async function( request, response )
{
    console.log("API_BOOKING_CREATE");
    try
    {
        const user = response.locals.user;
        const body = request.body;
        const createdFor = body.created_for;
        const alreadyBooked = await AXIAL_MONGO.getData("bookings", { created_for:createdFor, model:"booking_request" }, "booking_request" );
        if( alreadyBooked !== null )
        {
            response.json( { status: "ko", message: "booking_already_created" } );
            return;
        }
        const booking = await AXIAL_MONGO.setData("bookings", body, "booking_request" );
        //console.log(booking);

        if( body.kind == "event" )
        {
            const param = await AXIAL_MONGO.getData( "params", {model: "booking_param"}, "booking_param" );
            
            const client = await AXIAL_MONGO.getData("users", { uuid: createdFor }, "user" );
            const mailData = { title: "Votre prochain RDV", client: client, booking: body, param: param };
            const userMail = await AXIAL_MAILER.sendMail( "Votre prochain RDV", client.email, "booking_request_user", mailData );

            let mailStr = "";
            if( param.desti_1 != "" ) { mailStr = mailStr + param.desti_1 + ";"; }
            if( param.desti_2 != "" ) { mailStr = mailStr + param.desti_2 + ";"; }
            if( param.desti_3 != "" ) { mailStr = mailStr + param.desti_3 + ";"; }

            if( mailStr != "" )
            {
                const adminMail = await AXIAL_MAILER.sendMail( "Nouveau RDV Programmé", mailStr, "booking_request_admin", mailData );
            }
        }

        if( booking.acknowledged == true )
        {
            response.json( BASIC_OK );

        }
        else
        {
            response.json( BASIC_KO ); // todo avertir user
        }
        
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
        
};

const apiBookingUpdate = async function( request, response )
{

};

const checkBooking = async function( createdFor )
{
    let currentBookings = [];
    const alreadyBooked = await AXIAL_MONGO.getData("bookings", { created_for:createdFor, model:"booking_request" }, "booking_request" );
    let hasBooking = false;
    if( alreadyBooked == null )
    {
        hasBooking = false;
    }
    else
    {
        if( Array.isArray( alreadyBooked ) == false )
        {
            currentBookings.push(alreadyBooked);
        }
        else
        {
            currentBookings = alreadyBooked;
        }
    }

    let bookingFound;
    for( const booking of currentBookings )
    {
        const bd = new Date( booking.booking_date ) ;
        const cd = new Date();

        if( bd.getTime() > cd.getTime() )
        {
            bookingFound = booking;
            hasBooking = true;
            break;
        }
    }
    return { has: hasBooking, booking: bookingFound };
}


const apiBookingGet = async function( request, response )
{
    console.log("API_BOOKING_GET");
    try 
    {
        const user = response.locals.user;
        const cf = user.uuid;
        const data = await checkBooking( cf );
        response.json( { status: "ok", content: data } );
    }
    catch(err)
    {
        console.log(err);
    }
};

const apiBookingCancel = async function( request, response )
{
    console.log("API_BOOKING_CANCEL");
    try 
    {
        const _id = request.body._id;
        const deletetion = await AXIAL_MONGO.delData( "bookings", _id );
        response.json( { status: "ok" } );
    }
    catch(err)
    {
        console.log(err);
    }
};


const apiBookingList = async function( request, response )
{
    console.log("API_BOOKING_LIST");
    try
    {
        let finalBookings = [];
        const bookings = await AXIAL_MONGO.getData("bookings", { model: "booking_request" }, "booking_request" );
        if( bookings !== null )
        {
            if( Array.isArray(bookings) === true )
            {
                finalBookings = bookings;
            }
            else
            {
                finalBookings.push(bookings);
            }
        }
        response.json( { status: "ok", content: finalBookings } );
    }
    catch(err)
    {
        console.log(err);
    }
};

const apiBookingParamGet = async function( request, response )
{
    console.log("API_BOOKING_PARAM_GET");
    try
    {
        const bookingParam = await AXIAL_MONGO.getData("params", { model: "booking_param" }, "booking_param" );
        response.json( { status: "ok", content: bookingParam } );
    }
    catch(err)
    {
        console.log(err);
    }
};


const apiBookingParamSet = async function( request, response )
{
    console.log("API_BOOKING_PARAM_SET");
    try
    {
        const user = response.locals.user;
        if( user.role != "admin" )
        {
            response.json( BASIC_KO );
            return;
        }
        const body = request.body;
        
        const params = await AXIAL_MONGO.setData("params", body, "booking_param" );
        response.json( BASIC_OK );
    }
    catch(err)
    {
        console.log(err);
    }
};

///
/// SEARCH
///
const apiSearchList = async function( request, response )
{
    console.log("API_SEARCH_LIST");
    try
    {
        const user = response.locals.localUser;
        //console.log(user)
        //const search = await AXIAL_MONGO.getData("bookings", { model: "booking_request" }, "booking_request" );
        
        response.json( BASIC_OK );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};
///
/// ERRORS
///

const reportServerError = async function( error )
{
    try
    {

    }
    catch(err){ console.log(err); }
};

const apiErrorCreate = async function( request, response )
{
    try
    {
        const body = request.body;
        const inserted = await AXIAL_MONGO.setData("errors", body);
        let error = body;
        error.title = "New Error catched";
        const mail = await AXIAL_MAILER.sendMail( "New Error catched", "david@dndev.fr", "error_base", body)
        response.json( BASIC_OK );

    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

const apiErrorTest = async function( request, response )
{
    throw new Error(" we test");
    response.json( BASIC_OK );
};

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiMeetingRequest = async function( request, response )
{
    console.log("API_MEETING_REQUEST");
    try
    {
        const body = request.body;
        console.log(body);
        const localUser = response.locals.user;
        const user = await AXIAL_MONGO.getData("users", { _id: localUser._id }, "user_base");
        console.log( user );
        const fullName = user.first_name + " " + user.last_name;
        const userMailObject = 
        {
            name: fullName,
            client_email: user.email,
            client_tel: user.tel,
            simulation_name: body.simulation_name
        }

        const toUser = await AXIAL_MAILER.sendMail( "Merci pour votre prise de contact", user.email, "meeting_request_user", userMailObject );
        const toAdmin = await AXIAL_MAILER.sendMail( "Demande de RDV", EMAIL_RECIPIENT, "meeting_request_admin", userMailObject );
        
        response.json( BASIC_OK );

    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
}

/// UTILS PRIVATE
/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiMessagingWebSocektUrlGet = function( request, response )
{
    try
    {
        const msu = MESSAGING_SOCKET_URL;
        response.json( { status: "ok", url: msu } );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

///
/// SERVER ROUTES
///

const AXIAL_SERVER_APPLICATION = express();

AXIAL_SERVER_APPLICATION.disable("x-powered-by");
//AXIAL_SERVER_APPLICATION.use( cors(CORS_OPTIONS) );
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
AXIAL_SERVER_APPLICATION.post( "/api/data/archive", apiDataArchive);

// AUTH
AXIAL_SERVER_APPLICATION.post( "/api/auth/signin", apiAuthSigninHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/signup", apiAuthSignupHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/signout", apiAuthSignoutHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/code/send", apiAuthCodeSendHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/code/verify", apiAuthCodeVerifyHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/email/check", apiAuthEmailCheckHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/password/request", apiAuthPasswordRequestHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/password/change", apiAuthPasswordChangeHandler);

// ONBOARDING
AXIAL_SERVER_APPLICATION.post( "/api/onboarding/contact", apiOnboardingContact);

// USERS OK
AXIAL_SERVER_APPLICATION.get( "/api/user/get", apiUserGet);
AXIAL_SERVER_APPLICATION.get( "/api/user/info", apiUserInfoGet);
AXIAL_SERVER_APPLICATION.get( "/api/user/list", apiUserList);
AXIAL_SERVER_APPLICATION.post( "/api/user/create", apiUserCreate);
AXIAL_SERVER_APPLICATION.post( "/api/user/update", apiUserUpdate);

// PROJECTS
AXIAL_SERVER_APPLICATION.post( "/api/projects/create", apiProjectsCreate );
AXIAL_SERVER_APPLICATION.get( "/api/projects/get", apiProjectsGet );
AXIAL_SERVER_APPLICATION.post( "/api/projects/update", apiProjectsUpdate );
AXIAL_SERVER_APPLICATION.get( "/api/projects/has", apiProjectsHas );

// SIMULATIONS
AXIAL_SERVER_APPLICATION.get( "/api/simulation/get", apiSimulationGet );
AXIAL_SERVER_APPLICATION.post( "/api/simulation/update", apiSimulationUpdate );
AXIAL_SERVER_APPLICATION.post( "/api/simulation/delete", apiSimulationDelete );
AXIAL_SERVER_APPLICATION.post( "/api/simulation/clone", apiSimulationClone );

// PRODUCTS
AXIAL_SERVER_APPLICATION.post( "/api/products/set", apiProductsSet ); // --> DEPRECATED

AXIAL_SERVER_APPLICATION.get( "/api/product/list", apiProductList ); 
AXIAL_SERVER_APPLICATION.post( "/api/product/create", apiProductCreate );
AXIAL_SERVER_APPLICATION.post( "/api/product/update", apiProductUpdate );

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

AXIAL_SERVER_APPLICATION.get( "/api/params/estimation/legal/get", apiParamsEstimationLegalGet );
AXIAL_SERVER_APPLICATION.post( "/api/params/estimation/legal/set", apiParamsEstimationLegalSet );

AXIAL_SERVER_APPLICATION.get( "/api/params/estimation/address/get", apiParamsEstimationAddressGet );
AXIAL_SERVER_APPLICATION.post( "/api/params/estimation/address/set", apiParamsEstimationAddressSet );

AXIAL_SERVER_APPLICATION.get( "/api/params/estimation/mail/get", apiParamsEstimationMailGet );
AXIAL_SERVER_APPLICATION.post( "/api/params/estimation/mail/set", apiParamsEstimationMailSet );

AXIAL_SERVER_APPLICATION.get( "/api/params/estimation/image/get", apiParamsEstimationImageGet );
AXIAL_SERVER_APPLICATION.post( "/api/params/estimation/image/set", apiParamsEstimationImageSet );

AXIAL_SERVER_APPLICATION.get( "/api/params/company/timeshift/get", apiParamsCompanyTimeShiftGet );
AXIAL_SERVER_APPLICATION.post( "/api/params/company/timeshift/set", apiParamsCompanyTimeShiftSet );

// SERVICES
AXIAL_SERVER_APPLICATION.post( "/api/services/qrcode/", apiServicesQRCode );

// PUSH
AXIAL_SERVER_APPLICATION.post( "/api/push/subscribe", apiPushSubscribe);
AXIAL_SERVER_APPLICATION.post( "/api/push/unsubscribe", apiPushUnsubscribe);
AXIAL_SERVER_APPLICATION.post( "/api/push/send", apiPushSend);
AXIAL_SERVER_APPLICATION.get( "/api/push/vapid", apiPushVapid);

// MEDIAS
AXIAL_SERVER_APPLICATION.get( "/api/medias/get", apiMediasGetHandler );
AXIAL_SERVER_APPLICATION.get( "/api/medias/all", apiMediasAllHandler );
AXIAL_SERVER_APPLICATION.get( "/api/medias/public", apiMediasPublicHandler );
AXIAL_SERVER_APPLICATION.post( "/api/medias/upload", multerUploader.single("axial_file"), apiMediasUploadHandler );

AXIAL_SERVER_APPLICATION.post( "/api/file/upload", multerUploader.single("axial_file"), apiUploadFilePostHandler );
AXIAL_SERVER_APPLICATION.get( "/api/file/get/:id", apiUploadFileGetHandler );

// FILES
AXIAL_SERVER_APPLICATION.get( "/api/files/get/all", apiFilesGetAllHandler );

/// BOOKING
AXIAL_SERVER_APPLICATION.post( "/api/meeting/request", apiMeetingRequest );

AXIAL_SERVER_APPLICATION.post( "/api/booking/create", apiBookingCreate);
AXIAL_SERVER_APPLICATION.get( "/api/booking/list", apiBookingList);
AXIAL_SERVER_APPLICATION.get( "/api/booking/get", apiBookingGet);
AXIAL_SERVER_APPLICATION.post( "/api/booking/cancel", apiBookingCancel);

AXIAL_SERVER_APPLICATION.get( "/api/booking/param/get", apiBookingParamGet);
AXIAL_SERVER_APPLICATION.post( "/api/booking/param/set", apiBookingParamSet);


AXIAL_SERVER_APPLICATION.get( "/api/search/list", apiSearchList);

// ERROR
AXIAL_SERVER_APPLICATION.post( "/api/error/create", apiErrorCreate);
AXIAL_SERVER_APPLICATION.get( "/api/error/test", apiErrorTest);


// SUBSCRIPTIONS
AXIAL_SERVER_APPLICATION.post( "/api/subscriptions/set", apiSubscriptionsSet );
AXIAL_SERVER_APPLICATION.get( "/api/subscriptions/get", apiSubscriptionsGet );

AXIAL_SERVER_APPLICATION.post( "/api/checkout/session/create", apiCheckoutSessionCreate );
AXIAL_SERVER_APPLICATION.get( "/api/checkout/session/status", apiCheckoutSessionStatus );

// STRIPE WEBHOOKS
AXIAL_SERVER_APPLICATION.post( "/api/webhooks/stripe", apiWebhooksStripe );

// EVENTS
AXIAL_SERVER_APPLICATION.post( "/api/events/set", apiEventSet );

// CONVERSATIONS
AXIAL_SERVER_APPLICATION.get( "/api/conversation/list", apiConversationList );
AXIAL_SERVER_APPLICATION.get( "/api/conversation/contacts", apiConversationContacts );
AXIAL_SERVER_APPLICATION.post( "/api/conversation/create", apiConversationCreate );

// MESSAGES
AXIAL_SERVER_APPLICATION.get( "/api/message/get", apiMessageGet );
AXIAL_SERVER_APPLICATION.post( "/api/message/create", apiMessageCreate );

// MESSAGING
AXIAL_SERVER_APPLICATION.get( "/api/messaging/socket", apiMessagingWebSocektUrlGet );

// STATIC
AXIAL_SERVER_APPLICATION.use( "/", express.static( path.join( DIRNAME, "static" )) );
// NO DEV FOLDER
AXIAL_SERVER_APPLICATION.use( "/medias", express.static( path.join( DIRNAME, MEDIAS_FOLDER )) );
AXIAL_SERVER_APPLICATION.use( "/events", express.static( path.join( "events" )) ); // NOT NORMAL

AXIAL_SERVER_APPLICATION.use( "/pdf", express.static( path.join( "pdf" )) ); // NOT NORMAL

AXIAL_SERVER_APPLICATION.use( finalMiddleware );

const AXIAL_SERVER = http.createServer( AXIAL_SERVER_APPLICATION );

const SOCKETS_MAP = new Map();

// SOCKET ENTRY POINT
const socketOpenHandler = function( event )
{
    console.log("socket open");
    console.log(event);
};

const socketMessageHandler = function( data )
{
    console.log("socket message");
    const jsonData = JSON.parse( data.toString() );
    console.log( jsonData );
    
    const from = jsonData.from
    const type = jsonData.type;
    const value = jsonData.value;
    
    const allWS = Array.from( wss.clients );

    for( const ws of allWS )
    {
        if( ws == this )
        {
            console.log("same socket, do not send");
            continue;
        }

        const wsMap = SOCKETS_MAP.get(ws);
        ws.send( data.toString() );
        /*
        switch( type )
        {
            case "typing"
            default:
            break;
        }
        */
    }



    /*
    for( const ws of allWS )
    {
        ws.send( data.toString() );
    }
    */
    
    /// keep super important
    /*
    for( const ws of allWS )
    {
        if( ws == this )
        {
            console.log("same socket, do not send");
            continue;
        }
        ws.send( data.toString() );
    }
    */
};

const socketErrorHandler = function( event )
{
    console.log("socket error");
    console.log(event);
};

const socketCloseHandler = function( event )
{
    console.log("socket close");
    const ws = this;
    SOCKETS_MAP.delete(ws);
    //console.log(SOCKETS_MAP);
};

/**
 * 
 * @param { WebSocket } ws 
 * @param { IncomingMessage } im 
 */
const wssConnectionHandler = function ( ws, im )
{
    console.log("SOCKET CONNECTION");

    console.log(im.url);

    const SURL = new URL( im.url, MESSAGING_SOCKET_URL );
    const userUuid = SURL.searchParams.get("u");
    const userRole = SURL.searchParams.get("r");
    
    ws.addListener("open", socketOpenHandler);
    ws.addListener("message", socketMessageHandler);
    ws.addListener("error", socketErrorHandler);
    ws.addListener("close", socketCloseHandler);

    SOCKETS_MAP.set( ws, { role: userRole, uuid: userUuid } );

    //console.log( SOCKETS_MAP );
};


const wss = new WebSocketServer( { server: AXIAL_SERVER, path: "/ws" } );
wss.addListener("connection", wssConnectionHandler );


AXIAL_SERVER.listen(PORT);

export { AXIAL_SERVER, AXIAL_SERVER_APPLICATION }