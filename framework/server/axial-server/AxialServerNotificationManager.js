"use strict";

import EventEmitter from "node:events";
import { AxialMongo } from "./AxialMongo.js";
import webpush from "web-push";

class AxialServerNotificationManager extends EventEmitter
{
    /** @type { AxialServerNotificationManager } */
    static #instance = null;

    /** @type { AxialMongo } */
    static #MONGO;



    constructor()
    {
        super();
        if( AxialServerNotificationManager.#instance )
        {
            return AxialServerNotificationManager.#instance;
        }

        AxialServerNotificationManager.#instance = this;
    }

    /**
     * @static
     * @param { AxialMongo } value
     */
    static set mongo( value )
    {
        AxialServerNotificationManager.#MONGO = value;
    }

    static async sendNotification( title = "", message = "", recipients = [] )
    {
        console.log(title, message, recipients)
        try
        {
            const mongo = AxialServerNotificationManager.#MONGO;
            const pushTest = { title: title, body: message };
            const pushPayload = JSON.stringify(pushTest);

            for( const recipient of recipients )
            {
                const subscription =  await mongo.getData("notifications", { model: "notif_subscription", user_id: recipient } , "notif_subscription" );
                if( subscription )
                {
                    const subData = JSON.parse( subscription.subscription );
                    await webpush.sendNotification( subData, pushPayload );
                }
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

export { AxialServerNotificationManager }