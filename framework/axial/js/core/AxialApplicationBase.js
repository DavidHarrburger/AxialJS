"use strict"

/// axial imports
/// please imports all the components classes in the html file where the templates lives OR in the main js application file

import { LanguageUtils } from "../utils/LanguageUtils";

/**
 * The main base class for your application.
 * @class
 * @extends { EventTarget }
 */
class AxialApplicationBase extends EventTarget
{
    /// events
    #boundApplicationDomLoadedHandler;
    #boundApplicationPageLoadedHandler;
    #boundApplicationResizeHandler;
    #boundWindowResizeHandler;
    
    /// properties
    /**
     * @private
     * @type { any }
     * @default undefined
     */
    #data = undefined;

    /**
     * @private
     * @type { Boolean }
     * @default false
     */
    #applicationDomLoaded = false;

    /**
     * @private
     * @type { Boolean }
     * @default false
     */
    #applicationPageLoaded = false;

    /**
     * @private
     * @type { Boolean }
     * @default false
     */
    #useApplicationResize = false;

    /**
     * @private
     * @type { Number }
     * @default null
     */
    #applicationResizeTimeoutId = null;

    /**
     * @private
     * @type { Number }
     * @default 400
     */
    #applicationResizeTimeoutDelay = 300;

    /**
     * @private
     * @type { Boolean }
     * @default false
     */
    #isIOS = false;

    /**
     * @private
     * @type { Boolean }
     * @default false
     */
    #isAndroid = false;

    /**
     * @private
     * @type { Boolean }
     * @default false
     */
    #isDesktop = false;

    /**
     * @private 
     * @type { String | undefined }
     * @default undefined
     */
    #language = undefined

    /**
     * Create the main AxialApplicationBase and make it a property of its window.
     * The Application is freezed to avoid interference with others scripts.
     * @constructor
     */
    constructor()
    {
        super();
        
        if( window.AXIAL === undefined )
        {
            Object.freeze(this);
            window.AXIAL = this;
        }

        // language
        this.#language = LanguageUtils.getNavigatorLanguage();

        // ios
        this.#isIOS = ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

        // android
        this.#isAndroid = navigator.userAgent.toLowerCase().indexOf("android") >= 0;

        if( this.#isIOS == false && this.#isAndroid == false )
        {
            this.#isDesktop = true;
        }

        this.#boundApplicationDomLoadedHandler = this.#applicationDomLoadedHandler.bind(this);
        this.#boundApplicationPageLoadedHandler = this.#applicationPageLoadedHandler.bind(this);
        this.#boundApplicationResizeHandler = this.#applicationResizeHandler.bind(this);
        this.#boundWindowResizeHandler = this.#windowResizeHandler.bind(this);
        
        window.addEventListener("DOMContentLoaded", this.#boundApplicationDomLoadedHandler);
        window.addEventListener("load", this.#boundApplicationPageLoadedHandler);
    }

    get language() { return this.#language; }
    set language( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        if( this.#language == value ) { return; }
        this.#language = value;
        this._onApplicationLanguageChanged();
        const languageChangedEvent = new CustomEvent("languageChanged");
        this.dispatchEvent(languageChangedEvent);
    }

    _onApplicationLanguageChanged()
    {
        //console.log("AxialApplicationBase._onApplicationLanguageChanged()");
    }

    ///
    /// PART: ENV
    ///

    get isIOS() { return this.#isIOS; }

    get isAndroid() { return this.#isAndroid; }

    get isDesktop() { return this.#isDesktop; }

    ///
    /// PART: DATA
    ///

    /**
     * Get or set data to the application.
     * @type { any }
     * @param { any } value 
     */
    get data()
    {
        return this.#data;
    }
    set data( value )
    {
        if( this.#data == value ) { return; }
        this.#data = value;
        this._onApplicationDataChanged();
        const dataChangedEvent = new CustomEvent("applicationDataChanged", { detail: this.#data });
        this.dispatchEvent(dataChangedEvent);
    }

    /**
     * This method is called once the data property has just been setted and before the AxialApplicationBase dispatches the dataChanged Custom Event.
     * @public
     * @abstract
     */
    _onApplicationDataChanged()
    {
        //console.log("AxialApplicationBase._onApplicationDataChanged()");
    }

    ///
    /// PART: DOM LOADED
    ///
    
    /**
     * Get the DOMContentLoaded status of the window, bounded into the Axial application.
     * @public
     * @type { Boolean }
     * @readonly
     */
    get applicationDomLoaded() { return this.#applicationDomLoaded; }

    /**
     * The internal DOMContentLoaded handler bounded in the AxialApplicationBase for its lifecycle.
     * Call its associated _onApplicationDomLoaded method.
     * @private
     */
    #applicationDomLoadedHandler(event)
    {
        this.#applicationDomLoaded = true;

        if( this._onApplicationDomLoaded )
        {
            this._onApplicationDomLoaded(event);
        }
    }

    /**
     * This method is called once the window DOMContentLoaded event is fired. You can perform some actions on the DOM here.
     * If you have declared some component in your html files, these are on the DOM and you can manipulate them.
     * @public
     * @param { Event } event - The DOMContentLoaded event of the window.
     * @abstract
     */
    _onApplicationDomLoaded(event)
    {
        //console.log("AxialApplicationBase._onApplicationDomLoaded()");
    }

    ///
    /// PART: PAGE LOADED
    ///

    /**
     * Get the load status of the window, bounded into the Axial application.
     * @public
     * @type { Boolean }
     * @readonly
     */
    get applicationPageLoaded() { return this.#applicationPageLoaded; }

    /**
     * The internal load handler bounded in the AxialApplicationBase for its lifecycle.
     * Call its associated _onApplicationPageLoaded method.
     * @private
     */
    #applicationPageLoadedHandler(event)
    {
        this.#applicationPageLoaded = true;

        if( this._onApplicationPageLoaded )
        {
            this._onApplicationPageLoaded(event);
        }
    }

    /**
     * This method is called once the window load event is fired. You can really start your application here :)
     * @public
     * @param { Event } event - The load event of the window.
     * @abstract
     */
    _onApplicationPageLoaded(event)
    {
        //console.log("AxialApplicationBase._onApplicationPageLoaded()");
    }

    get useApplicationResize() { return this.useApplicationResize; }
    set useApplicationResize( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#useApplicationResize == value ) { return; }
        this.#useApplicationResize = value;
        
        if( this.#useApplicationResize == false )
        {
            window.removeEventListener("resize", this.#boundWindowResizeHandler);
        }
        else
        {
            window.addEventListener("resize", this.#boundWindowResizeHandler);
        }
    }

    #windowResizeHandler( event )
    {
        if( this.#applicationResizeTimeoutId !== null )
        {
            clearTimeout(this.#applicationResizeTimeoutId);
        }
        this.#boundApplicationResizeHandler();
        this.#applicationResizeTimeoutId = setTimeout( this.#boundApplicationResizeHandler, this.#applicationResizeTimeoutDelay);

    }

    #applicationResizeHandler( event )
    {
        this.#applicationResizeTimeoutId = null;

        if( this._onApplicationResize )
        {
            this._onApplicationResize();
            
        }
    }

    _onApplicationResize()
    {
        console.log("AxialApplicationBase._onApplicationResize()");
    }
}

export { AxialApplicationBase }