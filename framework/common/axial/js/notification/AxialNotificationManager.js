"use strict"

import { PathUtils } from "../utils/PathUtils.js";
import { FetchUtils } from "../utils/FetchUtils.js";
import { CryptoUtils } from "../utils/CryptoUtils.js";
import { StringUtils } from "../utils/StringUtils.js";

class AxialNotificationManager extends EventTarget
{
    /** @type { AxialNotificationManager } */
    static #instance;

    /** @type { String } */
    #id;

    /** @type { Boolean } */
    #initialized = false;

    /** @type { String } */
    #workerPath = "./service-worker.js";

    /** @type { String } */
    #workerScope = "/";

    /** @type { String } */
    #pushSubscribePath = "./api/push/subscribe";

    /** @type { String } */
    #pushUnsubscribePath = "./api/push/unsubscribe";

    /** @type { String } */
    #vapidPath = "./api/push/vapid";

    /** @type { String } */
    #vapidPublicKey;

    /** @type { ServiceWorkerRegistration} */
    #registration;

    /** @type { PushSubscription } */
    #subscription;

    /// events

    constructor()
    {
        super();
        if( AxialNotificationManager.#instance )
        {
            return AxialNotificationManager.#instance;
        }

        this.#workerPath          = PathUtils.getPathFromRelative( this.#workerPath );
        this.#pushSubscribePath   = PathUtils.getPathFromRelative( this.#pushSubscribePath );
        this.#pushUnsubscribePath = PathUtils.getPathFromRelative( this.#pushUnsubscribePath );
        this.#vapidPath           = PathUtils.getPathFromRelative( this.#vapidPath );

        AxialNotificationManager.#instance = this;
    }

    /**
     * @type { NotificationPermission }
     * @readonly
     */
    get permission() { return Notification.permission; }

    /**
     * @type { Boolean }
     * @readonly
     */
    get isGranted() { return Notification.permission === "granted"; }

    /**
     * @type { Boolean }
     * @readonly
     */
    get isDenied() { return Notification.permission === "denied"; }

    /**
     * @type { Boolean }
     * @readonly
     */
    get isDefault() { return Notification.permission === "default"; }

    /**
     * @type { Boolean }
     * @readonly
     */
    get isSubscribed() { return !!this.#subscription; }

    /**
     * @type { PushSubscription }
     * @readonly
     */
    get subscriptionInfo() { return this.#subscription; }

    /**
     * @type { Boolean }
     * @readonly
     */
    get isSupported() { return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window ;}

    /**
     * @readonly
     */
    get state()
    {
        const state = 
        {
            permission: this.permission,
            isGranted: this.isGranted,
            isDefault: this.isDefault,
            isDenied: this.isDenied,
            isSubscribed: this.isSubscribed,
            canPrompt: this.permission === "default",
            isInitialized: this.#initialized,
            hasServiceWorker: "serviceWorker" in navigator,
            hasPushManager: "PushManager" in window,
            supported: "Notification" in window && "serviceWorker" in navigator && "PushManager" in window
            
        }

        return state;
    }

    /**
     * @readonly
     */
    get status()
    {
        if( this.isSupported === false )
        {
            return "not_supported";
        }
        
        if( this.isSubscribed === true )
        {
            return "subscribed";
        }

        if( this.isGranted === true )
        { 
            return "authorized";
        }

        if( this.isDenied === true )
        {
            return "blocked";
        }

        if( this.isDefault === true )
        {
            return "pending";
        }
        return "unknown";
    }

    static getInstance()
    {
        if( !AxialNotificationManager.#instance )
        {
            AxialNotificationManager.#instance = new AxialNotificationManager();
        }
        return AxialNotificationManager.#instance;
    }

    /**
     * 
     * @param { String } id A unique identifier to create the push subscription.
     */
    async init( id ) { await this.#init( id ); }
    

    /**
     * 
     * @param { String } id A unique identifier to create the push subscription
     */
    async #init( id )
    {
        if( this.state.supported === false )
        {
            this.#initialized = true;
            const notificationManagerEvent  = new CustomEvent( "notificationInitialized" );
            this.dispatchEvent( notificationManagerEvent );
            return;
        }
        if( this.#initialized ) { return; }
        // check the id : wee need it
        if( StringUtils.isWhite(id) == true )
        {
            throw new Error("String value required");
        }

        this.#id = id;

        // check if vapid public key is here, we can't go further without this key
        if( this.#vapidPublicKey === undefined )
        {
            if( this.#vapidPath !== undefined )
            {
                const vapidJson = await FetchUtils.GET( this.#vapidPath );
                if( vapidJson && vapidJson.status === "ok" )
                {
                    this.#vapidPublicKey = vapidJson.key;
                }
            }
        }
        
        // final vapid check
        if( this.#vapidPublicKey === undefined )
        {
            throw new Error("Valid VAPID key required");
        }

        try
        {
            const registrations = await navigator.serviceWorker.getRegistrations();
            const tempRegistration = registrations.find( reg => reg.scope === `${location.origin}/` );
            if( tempRegistration === undefined )
            {
                const newRegistration = await navigator.serviceWorker.register( this.#workerPath, { scope: this.#workerScope } );
            }
            
            const readyRegistration = await navigator.serviceWorker.ready;
            if( readyRegistration )
            {
                this.#registration = readyRegistration;
            }

            if( this.#registration )
            {
                this.#subscription = await this.#registration.pushManager.getSubscription();
            }
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            console.log( "R", this.#registration )
            console.log( "S", this.#subscription )
            this.#initialized = true;

            const notificationEvent  = new CustomEvent( "notificationInitialized" );
            this.dispatchEvent( notificationEvent );
        }
    }

    
    async requestPermission()
    {
        if( this.state.supported === false )
        {
            return;
        }
        if( this.isDefault === true )
        {
            const permissionState = await Notification.requestPermission();
            console.log( permissionState );
            if( permissionState === "granted" )
            {
                await this.subscribe();
            }
            const notificationEvent = new CustomEvent( "notificationStatusChanged" );
            this.dispatchEvent( notificationEvent );
        }
    }

    async subscribe()
    {
        if(this.#vapidPublicKey === undefined ) { return; }
        if( this.#subscription ) { return; }

        try
        {
            const options =
            {
                userVisibleOnly: true,
                applicationServerKey: CryptoUtils.urlBase64ToUint8Array( this.#vapidPublicKey )
            }
            this.#subscription = await this.#registration.pushManager.subscribe( options );

            // send the subscription to the server
            const notifPayload = 
            {
                user_id: this.#id,
                subscription: JSON.stringify( this.#subscription )
            }
            const json = await FetchUtils.POST( this.#pushSubscribePath, notifPayload );
            console.log(json);
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            const notificationEvent = new CustomEvent( "notificationStatusChanged" );
            this.dispatchEvent( notificationEvent );
        }
    }

    async unsubscribe()
    {
        let done = false;
        if( this.#subscription === undefined ) { return done ; }
        try
        {
            done = await this.#subscription.unsubscribe();
            const deleted = await FetchUtils.POST( this.#pushUnsubscribePath, { test: "test" } );
            console.log(deleted);
            if( done === true )
            {
                this.#subscription = undefined;
            }
            return done;
        }
        catch(err)
        {
            console.log(err);
            return done;
        }
        finally
        {
            const notificationEvent = new CustomEvent( "notificationStatusChanged" );
            this.dispatchEvent( notificationEvent );
        }
    }

}

export { AxialNotificationManager }