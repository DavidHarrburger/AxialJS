import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import nodemailer from "nodemailer";

const FILENAME = fileURLToPath( import.meta.url );
const DIRNAME = path.dirname(FILENAME);

const BASIC_OK = { status: "ok" };
const BASIC_KO = { status: "ko" };

const EMAIL_HOST = "your.host.net";
const EMAIL_PASS = "your_super_password";
const EMAIL_PORT = 465;
const EMAIL_USER = "no-reply@domain.com";
const EMAIL_RECIPIENT = "recipient@domain.com";

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

const apiMailMessagePostHandler = async function( request, response )
{
    try
    {
        const body = request.body;
        const infos = { name: body.name, email: body.email, message: body.message };

        let htmlFrom = "<h2>Votre message à dndev.fr !</h2>";
        htmlFrom += "<p>Merci d'avoir pris contact. Nous vous répondrons dans les plus brefs délais. Ci-dessous le message que vous avez envoyé :";
        htmlFrom += "<p style='font-style: italic'>" + infos.message + "</p>";

        const mailFrom = await EMAIL_TRANSPORTER.sendMail(
        {
            from: "<" + EMAIL_USER + ">",
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

const AXIAL_SERVER_APPLICATION = express();

AXIAL_SERVER_APPLICATION.disable("x-powered-by");

AXIAL_SERVER_APPLICATION.use( startMiddleware );
AXIAL_SERVER_APPLICATION.use( express.json() );
AXIAL_SERVER_APPLICATION.use( express.urlencoded( { extended: true } ) );

AXIAL_SERVER_APPLICATION.post( "/api/mail/message", apiMailMessagePostHandler );
AXIAL_SERVER_APPLICATION.post( "/api/mail/contact", apiMailContactPostHandler );

AXIAL_SERVER_APPLICATION.use( express.static( path.join( DIRNAME, "static" )) );
AXIAL_SERVER_APPLICATION.use( finalMiddleware );

export default AXIAL_SERVER_APPLICATION;