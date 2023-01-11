"use strict"

import { Environment } from "../core/Environment";
import { AxialComponentBase } from "./AxialComponentBase";
import { AxialLoaderBase } from "../loader/AxialLoaderBase";
import { AxialApplicationLoaderBase } from "../loader/AxialApplicationLoaderBase";

class AxialApplicationBase
{
    static #AXIAL_APPLICATION_RESIZER_TIMEOUT_ID = null;
    static #AXIAL_APPLICATION_RESIZER_TIMEOUT_DELAY = 100;

    #data;
    #dataRequest;
    #dataUrl = "";

    #dataLoaded = false;
    #domLoaded = false;

    #hasBeenStarted = false;
    #hasBeenBuilt = false;

    #loader; // model
    #applicationLoader; // ui
    #useApplicationLoader = false;
    #boundLoaderStartedHandler;
    #boundLoaderProgressHandler;
    #boundLoaderCompleteHandler;
    
    #resizables = new Array();

    #boundDomContentLoadedHandler;
    #boundDataLoadedHandler;
    #boundWindowResizedHandler;
    #boundResizeApplicationHandler;

    // right now we can't access to Permission interface or smtg like this
    // but we may need to know some permissions "status"
    // here just an impl of DeviceOritentationEvent. 
    // you could do the same (or smtg like this) for all Sensors
    #deviceOrientationStatus = "unknown";
    #boundDeviceOrientationStatusHandler;

    constructor()
    {
        /*
        if( Environment.isIOS == true )
        {
            document.addEventListener("touchmove", (event) => { event.preventDefault(); } , false );
        }
        */
        
        if( window["AXIAL"] == undefined )
        {
            window["AXIAL"] = this;
        }

        this.#boundDeviceOrientationStatusHandler = this.#deviceOrientationStatusHandler.bind(this);
        window.addEventListener("deviceorientationstatus", this.#boundDeviceOrientationStatusHandler);
        this.#requestDeviceOrientationPermission();

        this.#loader = new AxialLoaderBase();
        this.#boundLoaderStartedHandler = this.#loaderStartedHandler.bind(this);
        this.#boundLoaderProgressHandler = this.#loaderProgressHandler.bind(this);
        this.#boundLoaderCompleteHandler = this.#loaderCompleteHandler.bind(this);
        window.addEventListener("loaderstarted", this.#boundLoaderStartedHandler);
        window.addEventListener("loaderprogress", this.#boundLoaderProgressHandler);
        window.addEventListener("loadercomplete", this.#boundLoaderCompleteHandler);

        this.#boundDomContentLoadedHandler = this.#domContentLoadedHandler.bind(this);
        this.#boundDataLoadedHandler = this.#dataLoadedHandler.bind(this);

        this.#boundWindowResizedHandler = this.#windowResizedHandler.bind(this);
        this.#boundResizeApplicationHandler = this.#resizeApplicationHandler.bind(this);

        window.addEventListener("DOMContentLoaded", this.#boundDomContentLoadedHandler);
        window.addEventListener("resize", this.#boundWindowResizedHandler, false);
    }

    get deviceOrientationStatus() { return this.#deviceOrientationStatus; }

    #deviceOrientationStatusHandler(event)
    {
        this.#deviceOrientationStatus = event.status;
        this._onDeviceOrientationStatus();
    }

    get loader() { return this.#loader; }

    get useApplicationLoader() { return this.#useApplicationLoader; }
    set useApplicationLoader( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( this.#hasBeenStarted == true )
        {
            throw new Error("useApplicationLoader must be setted before the application starts");
        }
        if( value == this.#useApplicationLoader ) { return; } 
        this.#useApplicationLoader = value;
    }

    addResource( value = "" )
    {
        this.#loader.addResource(value);
    }

    start()
    {
        if( this.#hasBeenStarted == true ) { return; }
        this.#hasBeenStarted = true;
        if( this.#dataUrl != "" )
        {
            this.#loadData();
        }
        else
        {
            if( this.#domLoaded == true )
            {
                this.#prepareLoading();
            }
        }
    }

    #prepareLoading()
    {
        this.#applicationLoader = new AxialApplicationLoaderBase();
        this.#loadResources();
    }

    #loadResources()
    {
        this.#loader.start();
    }

    #loaderStartedHandler( event )
    {
        if( this.#useApplicationLoader == true )
        {
            this.#applicationLoader.text = "loading";
            this.#applicationLoader.show();
        }
    }

    #loaderProgressHandler( event )
    {
        if( this.#useApplicationLoader == true )
        {
            console.log(event.count);
            this.#applicationLoader.text = String(event.count);
        }
    }

    #loaderCompleteHandler( event )
    {
        if( this.#useApplicationLoader == true )
        {
            this.#applicationLoader.text = "finishing loading";
            this.#applicationLoader.hide();
        }
        this.#buildApplication();
    }

    #buildApplication()
    {
        console.log("#buildApplication()");
        if( this.#hasBeenBuilt == true ) { return; }
        this.#hasBeenBuilt = true;
        this._buildApplication();

        console.log("appReadyEvent");
        let appReadyEvent = new Event("appready");
        window.dispatchEvent(appReadyEvent);

    }

    _buildApplication() {}
    
    get data()
    {
        if( this.#data )
        {
            return this.#data;
        }
    }
    set data( value )
    {
        this.#data = value;
    }

    get dataUrl() { return this.#dataUrl; }
    set dataUrl( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value expected");
        }
        this.#dataUrl = value;
    }

    addEventListener( type, listener, useCapture = false)
    {
        window.addEventListener(type, listener, useCapture);
    }

    removeEventListener( type, listener, useCapture = false)
    {
        window.removeEventListener(type, listener, useCapture);
    }

    /**
     * Return all the Axial Components registered for resize
     * @return { Array }
     */
    get resizables()
    {
        if( this.#resizables ) { return this.#resizables; }
    }

    registerComponentForResize( component )
    {
        if( component instanceof AxialComponentBase == false )
        {
            throw new TypeError();
        }
        if( this.#resizables.indexOf(component) > - 1) { return; } // component already registered for resize
        this.#resizables.push( component );
    }

    _parseData() {}
    #parseData()
    {
        this._parseData();
        this.#dataLoaded = true;
        console.log("dataReadyEvent");
        let dataReadyEvent = new Event("dataready");
        window.dispatchEvent(dataReadyEvent);

        if( this.#domLoaded == true )
        {
            this.#prepareLoading();
        }
    }

    #loadData()
    {
        this.#dataRequest = new XMLHttpRequest();
        this.#dataRequest.addEventListener( "readystatechange", this.#boundDataLoadedHandler, false);
        this.#dataRequest.open("GET", this.#dataUrl, true);
        this.#dataRequest.send();
    }

    #domContentLoadedHandler( event )
    {
        this.#domLoaded = true;
        window.removeEventListener("DOMContentLoaded", this.#boundDomContentLoadedHandler);
        console.log("domReadyEvent");
        let domReadyEvent = new Event("domready");
        window.dispatchEvent(domReadyEvent);

        if( this.#dataLoaded == true )
        {
            this.#prepareLoading();
        }
        else if( this.#dataUrl == "" )
        {
            this.#prepareLoading();
        }
    }
    
    #dataLoadedHandler( event )
    {
        if( event.target.readyState == 4 )
        {
            if( event.target.status == 200 )
            {
                let tempData = event.target.response;
                this.#data = tempData;
                this.#parseData();
            }
        }
    }

    #windowResizedHandler( event )
    {
        if( AxialApplicationBase.#AXIAL_APPLICATION_RESIZER_TIMEOUT_ID !== null )
        {
            clearTimeout( AxialApplicationBase.#AXIAL_APPLICATION_RESIZER_TIMEOUT_ID );
        }

        this.#boundResizeApplicationHandler();

        AxialApplicationBase.#AXIAL_APPLICATION_RESIZER_TIMEOUT_ID = 
        setTimeout(this.#boundResizeApplicationHandler, AxialApplicationBase.#AXIAL_APPLICATION_RESIZER_TIMEOUT_DELAY );
    }

    #resizeApplicationHandler()
    {
        AxialApplicationBase.#AXIAL_APPLICATION_RESIZER_TIMEOUT_ID = null;

        if( this.#resizables && this.#resizables.length > 0 )
        {
            let rl = this.#resizables.length;
            for( let i = 0; i < rl; i++ )
            {
                let component = this.#resizables[i];
                try
                {
                    // just in case the _resize() method was deleted
                    component._resize();
                }
                catch(err)
                {
                    /// TODO : we will see later
                }
            }
        }
    }

    // testing purpose of permissions
    _onDeviceOrientationStatus() {} // override
    
    requestDeviceOrientationPermission()
    {
        this.#requestDeviceOrientationPermission();
    }
    
    #requestDeviceOrientationPermission()
    {
        /// ios 13+ special case
        if( window.DeviceOrientationEvent )
        {
            // ios 13 requestPermission case
            if( typeof window.DeviceOrientationEvent.requestPermission === "function" )
            {
                DeviceOrientationEvent.requestPermission().then
                (
                    function( state )
                    {
                        if( state !== "" )
                        {
                            let deviceOrientationStatusEvent = new Event("deviceorientationstatus");
                            deviceOrientationStatusEvent.status = state;
                            window.dispatchEvent(deviceOrientationStatusEvent);
                        }
                    }
                )
            }
            else
            {
                this.#deviceOrientationStatus = "granted";
            }
        }
        else
        {
            this.#deviceOrientationStatus = "unavailable";
        }
    }
}

export { AxialApplicationBase }