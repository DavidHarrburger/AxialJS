"use strict";

console.log("hello service worker !")
console.log( self );

const VERSION = "0.0.34";
const CACHE_NAME = `test-srflow-fr_${VERSION}`;
const STATIC_APP_RESSOURCES = 
[
    "/",
    "/index.html",
    "/styles.css",
    "/application.js"
];

const NOTIFICATION_ICON = "/assets/logos/logo.png";
const NOTIFICATION_DEFAULT = 
{
    title: "Notification default",
    body: "Une notification vous a été envoyée mais ne peut s'afficher. Connectez-vous pour récupérer la notification",
    tag: "srflow-fr",
    icon: NOTIFICATION_ICON
};


/// HANDLERS

/**
 * 
 * @param { ExtendableEvent } event 
 */
const installHandler = async function( event )
{
    console.log("SW INSTALL");
    //event.waitUntil( setInstallCache() );
    self.skipWaiting();
};

/**
 * 
 * @param { ExtendableEvent } event 
 */
const activateHandler = async function( event )
{
    console.log("SW ACTIVATE");
    event.waitUntil( self.clients.claim() );
};

/**
 * 
 * @param { PushEvent } event 
 */
const pushHandler = function( event )
{
    console.log("SW PUSH");
    event.waitUntil( manageNotification( event ) );
    /*
    try
    {
        const data = event.data?.json() ?? NOTIFICATION_DEFAULT;
        const title = data.title;
        const body = data.body
        const icon = NOTIFICATION_ICON;

        event.waitUntil( self.registration.showNotification( title, { body: body, icon: icon } ) );
    }
    catch(err)
    {
        console.log("push error", err);
    }
    */
    
};

/// UTILS
const setInstallCache = async function()
{
    try
    {
        const cache = await caches.open( CACHE_NAME );
        cache.addAll( STATIC_APP_RESSOURCES );
        return;
    }
    catch( err )
    {
        console.log( err );
    }
};

const updateCache = async function()
{
    try
    {
        const keys = await caches.keys();
        let promises = [];
        for( const k of keys )
        {
            if( k !== CACHE_NAME )
            {
                promises.push( caches.delete(k) );
            }
        }
        await Promise.all( promises );
        return;
    }
    catch( err )
    {
        console.log( err );
    }
};

const manageNotification = async function( event )
{
    console.log( event );
    try
    {
        const data = event.data?.json() ?? NOTIFICATION_DEFAULT;
        const title = data.title;
        const body = data.body
        const icon = NOTIFICATION_ICON;

        self.registration.showNotification( title, { body: body, icon: icon } );
    }
    catch(err)
    {
        console.log(err);
    }
};



/// LISTENERS
self.addEventListener("install", installHandler );
self.addEventListener("activate", activateHandler );
self.addEventListener("push", pushHandler );