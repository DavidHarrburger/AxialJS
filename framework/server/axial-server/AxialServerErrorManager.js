"use strict";

import EventEmitter from "node:events";
import process from "node:process";

import { AxialMongo } from "./AxialMongo.js";
import { AxialMailer } from "./AxialMailer.js";

class AxialServerErrorManager extends EventEmitter
{
    static #instance = null;

    /** @type { AxialMongo } */
    static #MONGO;

    /** @type { AxialMailer } */
    static #MAILER;

    constructor()
    {
        super();
        if( AxialServerErrorManager.#instance )
        {
            return AxialServerErrorManager.#instance;
        }

        AxialServerErrorManager.#instance = this;
        this.#installGlobalHandlers();
    }

    /**
     * @static
     * @param { AxialMongo } value
     */
    static set mongo( value )
    {
        AxialServerErrorManager.#MONGO = value;
    }

    /**
     * @static
     * @param { AxialMailer } value
     */
    static set mailer( value )
    {
        AxialServerErrorManager.#MAILER = value;
    }

    async report( type, o )
    {
        console.log("[AXIAL___SERVER___ERROR___MANAGER]");
        try
        {
            //console.log(o)
            const payload = 
            {
                t: type,
                w: "back",
                o: o,
                d: new Date().toISOString()
            }
        
            if( AxialServerErrorManager.#MONGO )
            {
                const mongo = AxialServerErrorManager.#MONGO;
                const inserted = await mongo.setData("errors", payload);
            }

            if( AxialServerErrorManager.#MAILER )
            {
                const mailer = AxialServerErrorManager.#MAILER;
                const mail = await mailer.sendMail( "New Error catched", "david@dndev.fr", "error_base", payload);
            }
        }
        catch(err)
        {
            console.log(err);
            // cynisme à son apogée
        }
        
    }

    #installGlobalHandlers()
    {
        process.on("uncaughtException", ( except ) =>
        {
            this.report( "uncaughtException", except );
        });

        process.on("unhandledRejection", ( reason ) =>
        {
            this.report( "unhandledRejection", reason );
        });


        process.on("warning", ( warning ) =>
        {
            this.report( "warning", warning );
        });
    
    }

    errorMiddleware( err, req, res, next )
    {
        AxialServerErrorManager.#instance.report( "exception", err);
        //console.error( err.message );
        res.json("Oups we are sorry, our developper teams has just been informed and will fix the problem.")
    }
}

export { AxialServerErrorManager }