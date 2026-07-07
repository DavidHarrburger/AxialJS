"use strict";

///
/// APPLICATION
///

import { AxialApplicationBase } from "./AxialApplicationBase.js";

///
/// AUTH
///

import { AxialAuthBox } from "../auth/AxialAuthBox.js";

///
/// BUTTON
///

import { AxialBurgerButton } from "../button/AxialBurgerButton.js";

///
/// HELPERS
///

import { AxialNavigationHelper } from "../helpers/AxialNavigationHelper.js";

///
/// UTILS
///

import { PathUtils } from "../utils/PathUtils.js";
import { CryptoUtils } from "../utils/CryptoUtils.js";

///
/// WEBSOCKET
///

import { AxialWebSocket } from "../websocket/AxialWebSocket.js";

class AxialWebApplicationBase extends AxialApplicationBase
{
    /// vars
    /** @type { String } */
    #userUuid;

    /** @type { String } */
    #userPath = "./api/data/get/?c=users&m=user_base";

    /** @type { Object } */
    #userObject;

    /// elements
    /** @type { AxialBurgerButton } */
    #menuButton;

    /** @type { HTMLElement} */
    #menuPanel;

    /** @type { AxialNavigationHelper} */
    #desktopNavHelper;

    /** @type { AxialNavigationHelper} */
    #mobileNavHelper;

    /// authbox
    /** @type { AxialAuthBox } */
    #authBox;

    /// events
    /** @type { Function } */
    #boundMenuButtonHandler;

    /** @type { Function } */
    #boundDesktopNavItemFoundHandler;

    /** @type { Function } */
    #boundMobileNavItemFoundHandler;

    /** @type { Function } */
    #boundNavigationItemClickHandler;

    /// websocket
    /** @type { AxialWebSocket } */
    #websocket;

    /** @type { String } */
    #localSocketUrl;

    // socket events
    /** @type { Function } */
    #boundAppSocketOpenHandler;

    /** @type { Function } */
    #boundAppSocketMessageHandler;

    /** @type { Function } */
    #boundAppSocketErrorHandler;

    /** @type { Function } */
    #boundAppSocketCloseHandler;

    ///
    /// PART : PROGRESSIVE WEB APP
    ///

    /// WORKER
    /** @type { Boolean } */
    #useServiceWorker = false;

    /** @type { String } */
    #serviceWorkerPath = "./service-worker.js";

    /** @type { ServiceWorkerRegistration } */
    #serviceWorkerRegistration;

    /** @type { String } */ // we will move it into an api
    #vapidPublicKey;

    /** @type { Function } */
    #boundApplicationPageLoadedWorkerHandler;

    /// PUSH
    /** @type { String } */
    #pushSubscribePath = "./api/push/subscribe";

    constructor()
    {
        super();

        // auth
        this.#userPath = PathUtils.getPathFromRelative(this.#userPath);

        // ui
        this.#boundMenuButtonHandler = this.#menuButtonHandler.bind(this);
        this.#boundDesktopNavItemFoundHandler = this.#desktopNavItemFoundHandler.bind(this);

        // pwa --> worker
        this.#serviceWorkerPath = PathUtils.getPathFromRelative(this.#serviceWorkerPath);
        this.#boundApplicationPageLoadedWorkerHandler = this.#applicationPageLoadedWorkerHandler.bind(this);
        window.addEventListener("load", this.#boundApplicationPageLoadedWorkerHandler);

        // pwa --> push
        this.#pushSubscribePath = PathUtils.getPathFromRelative( this.#pushSubscribePath );

        // websocket
        this.#boundAppSocketOpenHandler = this.#appSocketOpenHandler.bind(this);
        this.#boundAppSocketMessageHandler = this.#appSocketMessageHandler.bind(this);
        this.#boundAppSocketErrorHandler = this.#appSocketErrorHandler.bind(this);
        this.#boundAppSocketCloseHandler = this.#appSocketCloseHandler.bind(this);
    }

    ///
    /// AUTH / USER
    ///

    /**
     * @type { Object }
     * @readonly
     */
    get userObject() { return this.#userObject; }

    /**
     * @type { String }
     * @readonly
     */
    get userUuid() { return this.#userUuid; }

    /**
     * 
     */
    async #getUser()
    {
        console.log("get user");
        try
        {
            const path = this.#userPath + "&f=uuid," + this.#userUuid;
            const response = await fetch( path, { method: "GET", headers: { "Content-Type":"application/json", "Cache-Control": "no-cache" } } );
            const json = await response.json();
            console.log(json);
            if( json && json.content && Array.isArray(json.content) && json.content.length === 1 )
            {
                this.#userObject = json.content[0];
                
            }
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            this.#updateApplicationWithUser();
            this._onApplicationUserReady();
            // dispatch
        }
    }

    #updateApplicationWithUser()
    {
        if( this.#userObject )
        {
            //document.title = this.#userObject.first_name;
            console.log(this.#userObject);
            if( this.#authBox )
            {
                this.#authBox.user = this.#userObject;
                this.#authBox.switchToState("connected");
            }

            this.#initPushService(); // maybe move to ger user
        }
        else
        {
            if( this.#authBox )
            {
                this.#authBox.switchToState("sign");
            }
        }
    }

    /**
     * @abstract
     */
    _onApplicationUserReady() {}

    ///
    /// PWA
    ///

    get useServiceWorker() { return this.#useServiceWorker; }
    set useServiceWorker( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#useServiceWorker === value ) { return; }
        this.#useServiceWorker = value;
        if( this.#useServiceWorker === true && this.applicationPageLoaded === true )
        {
            this.#initServiceWorker();
        }
    }

    get vapidPublicKey() { return this.#vapidPublicKey; }
    set vapidPublicKey( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#vapidPublicKey = value;
    }

    async #applicationPageLoadedWorkerHandler( event )
    {
        console.log( "page loaded for worker");
        if( this.#useServiceWorker === true )
        {
            await this.#initServiceWorker();
        }
    }

    async #initServiceWorker()
    {
        console.log("init service worker");
        if( "serviceWorker" in navigator )
        {
            try
            {
                const registrations = await navigator.serviceWorker.getRegistrations();
                const tempRegistration = registrations.find( reg => reg.scope === `${location.origin}/` );
                console.log( tempRegistration )
                
                if( tempRegistration === undefined )
                {
                    const newRegistration = await navigator.serviceWorker.register( this.#serviceWorkerPath, { scope: "/" } );
                }
                
                const readyRegistration = await navigator.serviceWorker.ready;
                if( readyRegistration )
                {
                    this.#serviceWorkerRegistration = readyRegistration;
                }

                console.log("SW READY");
                await this.#initPushService();
            }
            catch(err)
            {
                console.log(err);
            }
        }
    }

    async #initPushService()
    {
        console.log("initPushService");
        if( Notification.permission === "granted" && this.vapidPublicKey !== undefined && this.#serviceWorkerRegistration && this.#userObject )
        {
            let pushSubscription = await this.#serviceWorkerRegistration.pushManager.getSubscription();
            console.log("push registered", pushSubscription);
            if( pushSubscription === null )
            {
                //console.log("entry point register for Push");
                const pushSubscriptionOptions =
                {
                    userVisibleOnly: true,
                    applicationServerKey: CryptoUtils.urlBase64ToUint8Array( this.vapidPublicKey )
                }
                pushSubscription = await this.#serviceWorkerRegistration.pushManager.subscribe( pushSubscriptionOptions );
            }
            
            console.log( pushSubscription );
            console.log(JSON.stringify( pushSubscription) );
            if( this.userObject && this.userObject._id )
            {
                console.log( "we are able to register the subscription on the server" );
                const notifSubscription = 
                {
                    user_id: this.userObject._id,
                    subscription: JSON.stringify( pushSubscription )
                }
                try
                {
                    const response = await fetch(this.#pushSubscribePath, { method: "POST", body: JSON.stringify(notifSubscription), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
                    const json = await response.json();
                    console.log( json );
                }
                catch(err)
                {
                    console.log(err);
                }
            }
            else
            {
                console.log("user not logged in so notification impossible");
            }
        }
    }

    async initPushService() { await this.#initPushService(); }

    async #deleteCurrentPushSubscription()
    {
        let pushSubscription = await this.#serviceWorkerRegistration.pushManager.getSubscription();
        const done = await pushSubscription.unsubscribe();
        if( done === true )
        {
            console.log( "subscription deleted" );
        }
        return done;
    }

    async deleteCurrentPushSubscripton() { await this.#deleteCurrentPushSubscription(); }


    ///
    /// WEBSOCKET
    ///

    /**
     * @readonly
     * @type { AxialWebSocket }
     */
    get websocket() { return this.#websocket; }

    get localSocketUrl() { return this.#localSocketUrl; }
    set localSocketUrl( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        this.#localSocketUrl = value;

        if( this.#websocket === undefined )
        {
            this.#websocket = new AxialWebSocket(this.#localSocketUrl);
            this.#websocket.addEventListener("socketOpen", this.#boundAppSocketOpenHandler);
            this.#websocket.addEventListener("socketMessage", this.#boundAppSocketMessageHandler);
            this.#websocket.addEventListener("socketError", this.#boundAppSocketErrorHandler);
            this.#websocket.addEventListener("socketClose", this.#boundAppSocketCloseHandler);
        }
    }

    #appSocketOpenHandler( event )
    {
        this._onSocketOpen( event );
    }

    #appSocketMessageHandler( event )
    {
        this._onSocketMessage( event );
    }

    #appSocketErrorHandler( event )
    {
        this._onSocketError( event );
    }

    #appSocketCloseHandler( event )
    {
        this._onSocketClose( event );
    }

    /** @abstract */
    _onSocketOpen( event ) {}

    /** @abstract */
    _onSocketMessage( event ) {}

    /** @abstract */
    _onSocketError( event ) {}

    /** @abstract */
    _onSocketClose( event ) {}

    ///
    /// LIFECYCLE
    ///

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );

        this.#authBox = document.getElementById("axialAuthBox")

        this.#menuButton = document.getElementById("axialMenuButton");
        if( this.#menuButton )
        {
            this.#menuButton.addEventListener("toggleChanged", this.#boundMenuButtonHandler);
        }
        this.#menuPanel = document.getElementById("axialMenuPanel");

        this.#desktopNavHelper = document.getElementById("axialDesktopNavHelper");
        if( this.#desktopNavHelper )
        {
            this.#desktopNavHelper.addEventListener("navigationItemFound", this.#boundDesktopNavItemFoundHandler);
            this.#desktopNavHelper._updateItems();
        }
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );

        const uuid = localStorage.getItem("axial_auth_uuid");
        if( uuid )
        {
            this.#userUuid = uuid;
            this.#getUser();
        }
        else
        {
            if( this.#authBox )
            {
                this.#authBox.switchToState("sign");
            }
        }
    }

    ///
    /// UI
    ///

    #menuButtonHandler( event )
    {
        if( this.#menuPanel )
        {
            this.#menuPanel.style.transform = this.#menuButton.selected === true ? "translateX(0)" : "translateX(100%)";
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #desktopNavItemFoundHandler( event )
    {
        const item = event.detail.item;
        item.addEventListener("click", this.#boundNavigationItemClickHandler);
        item.style.cursor = "default";
        const line = item.children[1];
        if( line )
        {
            line.style.transitionProperty = "none";
            line.style.transform = "scale(1)";
        }
    }

    /**
     * 
     * @param { MouseEvent } event 
     */
    #navigationItemClickHandler( event )
    {
        event.preventDefault();
    }
}

export { AxialWebApplicationBase }