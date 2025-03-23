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
    AUTH_PATHES,

    API_PRIVATE_PATHES
}
from "./axial-server/AxialServerConstants.js";
import { AxialMongoUtils } from "./axial-server/AxialMongoUtils.js";
import { AxialCryptoUtils } from "./axial-server/AxialCryptoUtils.js";

import express from "express";
import path from "node:path";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";

import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
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

const MONGO_CLIENT = new MongoClient( DATABASE_URL,
{
    serverApi:
    {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

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
    //console.log(requestedPath);
    let authRequired = false;
    let isAPI = requestedPath.indexOf("/api/") === 0;
    //console.log("isAPI = " + isAPI);

    if( isAPI === false )
    {
        for( const authPath of AUTH_PATHES )
        {
            if( requestedPath === authPath.path || requestedPath === ( authPath.path + "/" ) )
            {
                authRequired = true;
                break;
            }
        }
    }
    else
    {
        for( const apiPath of API_PRIVATE_PATHES )
        {
            if( requestedPath === apiPath.path || requestedPath === ( apiPath.path + "/" ) )
            {
                authRequired = true;
                break;
            }
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
    //console.log( "token = " + token );
    if( token === undefined )
    {
        // token does not exist, the user is not connected so we redirect the user to ask connexion
        if( isAPI === false )
        {
            response.redirect( AUTH_LOGIN_PATH ); // TODO integrate the page asked for to do the good routing
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
        const client = await MONGO_CLIENT.connect();
        //console.log("test crash");
        const db = client.db(DATABASE_NAME);
        const users = db.collection("users");
        const user = await users.findOne( { uuid: verifiedToken.uuid } );

        if( user !== null )
        {
            // cool the token is ok and the user exists, he can go to the page
            response.locals.user = user;
            next();
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
                //console.log("it's okkkkkk");
                const payload = 
                {
                    username: user.username,
                    uuid: user.uuid,
                };
                const token = jwt.sign( JSON.stringify(payload), JWT_SECRET_KEY );

                response.cookie( "axial_auth_jwt", token, { httpOnly: true } );
                let userPage = "/";
                for( const authPath of AUTH_PATHES )
                {
                    if( authPath.permission === user.role )
                    {
                        userPage = authPath.path;
                    }
                }
                const responseUser = { username: user.username, page: userPage };
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
/// MEDIAS PART
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiMediasGetHandler = async function( request, response )
{
    console.log("[API] apiMediasGet");
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
    console.log("[API] apiMediasAll");
    try
    {
        const localUser = response.locals.user;
        console.log(localUser.uuid);
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
    console.log("[API] apiMediasPublic");
    try
    {
        
        const publicMediasPath = path.join( DIRNAME, MEDIAS_FOLDER );
        const dirExists = fs.existsSync(publicMediasPath);
        if( dirExists === true )
        {
            const publicMedias = await fsp.readdir(publicMediasPath);
            console.log(publicMedias);
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

        console.log(upFile);
        const filePublic = Boolean( Number( request.get("axial_filepublic") ) );
        console.log( typeof filePublic );
        console.log( filePublic );
        
        
        const finalFileName = String( Date.now() ) + "_____" + fileName;

        // check if directory exists and if it is accessible
        const mediasPath = path.join( DIRNAME, UPLOADS_FOLDER );
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
        if( filePublic === true )
        {
            const publicPath = path.join( DIRNAME, MEDIAS_FOLDER, finalFileName);
            const publicUploadedFile = await fsp.writeFile( publicPath, fileData, {encoding: "base64"} );
        }
        
        response.json( { status: "ok", message: `${fileName} successfully uploaded` } );
        
    }
    catch(err)
    {
        console.log(err);
        response.json( { status: "ko", message: "upload error" } );
    }
};

///
/// SITE PARAMS PART
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiSiteGetInfobarHandler = async function( request, response )
{
    try
    {
        const client = await MONGO_CLIENT.connect();
        const db = client.db( DATABASE_NAME );
        const collection = db.collection("params");
        const param = await collection.findOne( { name: "infobar" } );
        response.json( { status: "ok", content: param } );
    }
    catch(err)
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

const apiSiteSetInfobarHandler = async function( request, response )
{
    try
    {
        const document = request.body;
        console.log(document);
        // check document and replcae wrong values w/ defaults
        const client = await MONGO_CLIENT.connect();
        const db = client.db( DATABASE_NAME );
        const collection = db.collection("params");
        const result = await collection.updateOne
        (
            { name: "infobar" },
            {
                $set:
                {
                    isRequired: document.isRequired,
                    information: document.information,
                    dateStart: new Date(document.dateStart),
                    dateEnd: new Date(document.dateEnd)
                },
                $currentDate: { lastModified: true }
            }
        );
        response.json( { status: "ok", content: result } );
    }
    catch( err )
    {
        console.log(err);
        response.json( BASIC_KO );
    }
};

///
/// MODEL PART
///

/**
 * 
 * @param { Express.Request } request 
 * @param { Express.Response } response 
 */
const apiModelGet = async function( request, response )
{
    console.log("[API] apiModelGet");
    try
    {
        //console.log(request.query);
        const localUser = response.locals.user;
        //console.log(localUser);

        //let queryValid = false; // IMPORTANT check the query and return if invalid

        const q = request.query;
        console.log(q);
        const c = q.c;
        const m = q.m;
        const u = q.u;
        
        const client = await MONGO_CLIENT.connect();
        const db = client.db(DATABASE_NAME);

        const allCollections = await db.collections( { nameOnly: true } );
        let collectionNames = new Array();
        for( const col of allCollections )
        {
            if( col.collectionName != "models" )
            {
                collectionNames.push(col.collectionName);
            }
        }

        // find the required model in the models collection
        const modelsCollection = db.collection("models");
        let model = {};
        if( m != undefined )
        {
            model = await modelsCollection.findOne( { name: m } );//.toArray();
            if( m == "user" )
            {
                console.log("check role");
                //console.log("model user found");
                const userRole = localUser.role;
                //console.log("userRole = " + userRole);
                const roleIndex = ROLES.indexOf(userRole) + 1;
                //console.log("roleIndex = " + roleIndex);
                const rolesUpdated = ROLES.slice(roleIndex);
                //console.log(rolesUpdated);
                //console.log(model.props.role.list);
                model.props.role.list = rolesUpdated;
                //console.log(model.props.role.list);
            }
        }
        //console.log( "MODEL" );
        //console.log( model );
        

        // get all models from the required collection
        const currentCollection = db.collection( c );
        const collection = await currentCollection.find( {} ).toArray();
        for( const model of collection )
        {
            if( model.name == "user" )
            {
                const userRole = localUser.role;
                const roleIndex = ROLES.indexOf(userRole) + 1;
                const rolesUpdated = ROLES.slice(roleIndex);
                model.props.role.list = rolesUpdated;
            }
        }

        // get the current item
        let item = {};
        if( u != undefined )
        {
            item = await currentCollection.findOne({ _id: new ObjectId( String(u) ) } );
            //console.log( "ITEM" );
            //console.log(item);
    
            for( const p of Object.keys(item) )
            {
                console.log(item[p]);
                console.log( model.props[p] );
                const prop = model.props[p];
                if( prop != undefined && prop.type && prop.type === "string" && prop.crypted && prop.crypted === true )
                {
                    item[p] = AxialCryptoUtils.decrypt( item[p] );
                }
            }
        }
        //console.log(item)
        //console.log("role checker");
        //console.log(model.props.role.list);
        response.json( { status: "ok", content: { all: collectionNames, model: model, collection: collection, item: item } });
    }
    catch(err)
    {
        console.log(err);
        response.json("model get error");
    }
};

const apiModelSet = async function( request, response )
{
    //response.json( { status: "ok model" });
    
    try
    {
        const document = request.body;
        console.log(document);

        const mode = document.mode;
        const collectionName = document.collection;
        
        const client = await MONGO_CLIENT.connect();
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(collectionName);

        let object = document.object;
        let result = {};

        if( mode === "new" )
        {
            const modelExist = await collection.findOne( { name: document.name } );
            if( modelExist == null )
            {
                result = await collection.insertOne( object );
            }
        }
        else if( mode === "from" )
        {
            // 1) find the model
            console.log("1) find the model : name = " + object.model );
            const modelsCollection = db.collection("models");
            const modelReference = await modelsCollection.findOne( { name: object.model } );
            console.log("modelsReference found")
            console.log(modelReference);

            for( const prop of Object.keys( modelReference.props ) )
            {
                const crypted = modelReference.props[prop].crypted;
                if( crypted === true )
                {
                    object[prop] = AxialCryptoUtils.encrypt(object[prop]);
                }
            }

            object.uuid = crypto.randomUUID();
            result = await collection.insertOne( object );

        }
        response.json( { status: "ok", content: { result: result } });
    }
    catch(err)
    {
        console.log(err);
        response.json("model error");
    }
    
};

///
/// 2025
///
const apiDataGet = async function( request, response )
{
    console.log("API_DATA_GET");
    try
    {
        let documents = new Array();
        let collection = "";
        let filters = {};
        let model = "";

        //const collectionName = request.query.c;
        console.log(request.query);

        const query = request.query;
        for( const p of Object.keys(query) )
        {
            console.log(p, typeof query[p] );
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
                        console.log("comas = ", nc);
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
                        console.log(v);
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

        console.log("FILTERS");
        console.log(filters);

        if( collection !== "" )
        {
            documents = await MONGO.getData( collection, filters, model );
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
    console.log("API_DATA_SET");
    try
    {
        const doc = request.body;
        const col = doc.collection;
        const model = doc.model;
        //console.log( model )
        const insertedOrReplaced = await MONGO.setData( col, doc, model );
        //console.log(insertedOrReplaced);
        
        const result = { status: "ok", content: insertedOrReplaced };
        response.json( result );
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

// STATS
AXIAL_SERVER_APPLICATION.get( "/api/stats/get", apiStatsGetHandler );
AXIAL_SERVER_APPLICATION.post( "/api/stats/add", apiStatsAddHandler );

// CRYPTO
AXIAL_SERVER_APPLICATION.get( "/api/crypto/uuid", apiCryptoUuidHandler );
AXIAL_SERVER_APPLICATION.get( "/api/crypto/key", apiCryptoKeyHandler );
AXIAL_SERVER_APPLICATION.get( "/api/crypto/encrypt", apiCryptoEncryptHandler );

// AUTH
AXIAL_SERVER_APPLICATION.post( "/api/auth/signin", apiAuthSigninHandler);
// AXIAL_SERVER_APPLICATION.post( "/api/auth/signup", apiAuthSignupHandler);
AXIAL_SERVER_APPLICATION.post( "/api/auth/signout", apiAuthSignoutHandler);

// PARAMS (WEBSITE) -> I probably go also with some server params
AXIAL_SERVER_APPLICATION.get( "/api/site/infobar/get", apiSiteGetInfobarHandler );
AXIAL_SERVER_APPLICATION.post( "/api/site/infobar/set", apiSiteSetInfobarHandler );

// MEDIAS
AXIAL_SERVER_APPLICATION.get( "/api/medias/get", apiMediasGetHandler );
AXIAL_SERVER_APPLICATION.get( "/api/medias/all", apiMediasAllHandler );
AXIAL_SERVER_APPLICATION.get( "/api/medias/public", apiMediasPublicHandler );
AXIAL_SERVER_APPLICATION.post( "/api/medias/upload", multerUploader.single("axial_file"), apiMediasUploadHandler );

// DATABASE : NO API

// MODELS
AXIAL_SERVER_APPLICATION.get( "/api/model/get", apiModelGet );
AXIAL_SERVER_APPLICATION.post( "/api/model/set", apiModelSet );

AXIAL_SERVER_APPLICATION.use( "/", express.static( path.join( DIRNAME, "static" )) );
// NO DEV FOLDER
AXIAL_SERVER_APPLICATION.use( "/medias", express.static( path.join( DIRNAME, MEDIAS_FOLDER )) );

AXIAL_SERVER_APPLICATION.use( finalMiddleware );

export default AXIAL_SERVER_APPLICATION;