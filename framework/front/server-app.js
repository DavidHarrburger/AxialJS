import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILENAME = fileURLToPath( import.meta.url );
const DIRNAME = path.dirname(FILENAME);

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
const finalMiddleware = function( request, response, next )
{
    response.redirect("/");
};

///
/// SERVER ROUTES
///

const AXIAL_SERVER_APPLICATION = express();
AXIAL_SERVER_APPLICATION.disable("x-powered-by");
AXIAL_SERVER_APPLICATION.use( startMiddleware );
//AXIAL_SERVER_APPLICATION.use( express.json() );
//AXIAL_SERVER_APPLICATION.use( express.urlencoded( { extended: true } ) );
//AXIAL_SERVER_APPLICATION.use( cookieParser() );
AXIAL_SERVER_APPLICATION.use( "/", express.static( path.join( DIRNAME, "static" )) );
AXIAL_SERVER_APPLICATION.use( finalMiddleware );

export default AXIAL_SERVER_APPLICATION;