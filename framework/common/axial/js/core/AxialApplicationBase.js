"use strict";

import { LanguageUtils } from "../utils/LanguageUtils.js";
import { AxialOverlayManager } from "../overlay/AxialOverlayManager.js";
import { AxialDropdownManager } from "../dropdown/AxialDropdownManager.js";
import { AxialConsentManager } from "../application/AxialConsentManager.js";

import { AxialNotifier } from "../application/AxialNotifier.js";
import { AxialInformationBar } from "../application/AxialInformationBar.js";
import { AxialDeletionOverlay } from "../application/AxialDeletionOverlay.js";
import { AxialConsentOverlay } from "../application/AxialConsentOverlay.js";

/**
 * The main base class for your application.
 * @class
 * @extends { EventTarget }
 */
class AxialApplicationBase extends EventTarget
{
    ///
    /// PART : DATA
    ///

    /**
     * @private
     * @type { String }
     * @default undefined
     */
    #dataPath = undefined;

    /**
     * @private
     * @type { any }
     * @default undefined
     */
    #data = undefined;

    ///
    /// PART : ENV
    ///

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

    ///
    /// PART : LANGUAGE
    ///

    /**
     * @private 
     * @type { String | undefined }
     * @default undefined
     */
    #language = undefined;

    ///
    /// PART : DOM
    ///

    /**
     * @private
     * @type { Boolean }
     * @default false
     */
    #applicationDomLoaded = false;

    /**
     * @private
     * @type { Function }
     */
    #boundApplicationDomLoadedHandler;

    /**
     * @private
     * @type { Boolean }
     * @default false
     */
    #applicationPageLoaded = false;

    /**
     * @private
     * @type { Function }
     */
    #boundApplicationPageLoadedHandler;

    ///
    /// PART : RESIZE
    ///

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
     * @type { Function }
     */
    #boundApplicationResizeHandler;

    /**
     * @private
     * @type { Function }
     */
    #boundWindowResizeHandler;

    ///
    /// PART: STATS
    ///

    /**
     * @private
     * @type { Object }
     */
    #statsObject;

    /**
     * @private
     * @type { Boolean }
     */
    #useStats = false;

    /**
     * @private
     * @type { String }
     */
    #statsPath;

    /**
     * @private
     * @type { Boolean }
     */
    #statsSent = false;

    /**
     * @private
     * @type { Function }
     */
    #boundApplicationVisibilityChangeHandler;

    ///
    /// PART : SCROLL PARALLAX
    ///
    
    /**
     * The main container / holder we use to calculte the parallax regarding the scroll
     * Default looking for the 'main' tag of the page
     * Even it's a little bit opiniated, you should not really have to change it
     * @private
     * @type { HTMLElement }
     */
    #scrollParallaxHolder;

    /**
     * @private
     * @type { HTMLCollection }
     */
    #scrollParallaxSections;

    /**
     * @private
     * @type { Boolean }
     */
    #useScrollParallax = false;

    /**
     * @private
     * @type { Number }
     */
    #scrollParallaxY = 0;

    /**
     * @type { Number }
     */
    #scrollParallaxRatio = 0;

    /**
     * @type { Number }
     */
    #scrollParallaxAnimationId = undefined;

    /**
     * @type { Number }
     */
    #scrollParallaxTimeStart = 0;

    /**
     * @type { Number }
     */
    #scrollParallaxTimePrevious = 0;

    /** @type { Set.<String> } */
    #parallaxRatios = new Set( ["inner", "outer"] );

    /**
     * @type { Function }
     */
    #boundScrollHandler;

    /**
     * @type { Function }
     */
    #boundScrollParallax;

    ///
    /// PART : MOUSE PARALLAX
    ///

    /** @type { Boolean } */
    #useMouseParallax = false;

    /** @type { Function } */
    #boundMouseParallaxHandler;

    ///
    /// PART : TRANSITION LAYER
    ///

    /**
     * @private
     * @type { HTMLElement }
     */
    #transitionLayer;

    /**
     * @private
     * @type { Boolean }
     */
    #usePageTransitions = false;

    /**
     * @orivate
     * @type { Function }
     */
    #boundAnchorClickHandler;

    /**
     * @type { String }
     */
    #nextLocation;

    /**
     * @type { Function }
     */
    #boundTransitionLayerEndHandler;

    /**
     * @type { Function }
     */
    #boundPageShowHandler;

    ///
    /// UI
    ///

    /** @type { AxialNotifier } */
    #notifier;

    /** @type { AxialInformationBar } */
    #informationBar;

    /** @type { AxialConsentOverlay } */
    #consentOverlay;

    /** @type { AxialDeletionOverlay } */
    #deletionOverlay;

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

        // dom - lifecycle
        this.#boundApplicationDomLoadedHandler = this.#applicationDomLoadedHandler.bind(this);
        this.#boundApplicationPageLoadedHandler = this.#applicationPageLoadedHandler.bind(this);

        // resize
        this.#boundApplicationResizeHandler = this.#applicationResizeHandler.bind(this);
        this.#boundWindowResizeHandler = this.#windowResizeHandler.bind(this);

        // stats
        this.#statsObject = 
        {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            hostname: window.location.hostname,
            wiw: window.innerWidth,
            wih: window.innerHeight,
            dom: false,
            load: false,
            type: "page",
            kind: "view",
            dateStart: new Date()
        }

        this.#boundApplicationVisibilityChangeHandler = this.#applicationVisibilityChangeHandler.bind(this);

        // transition layer
        this.#boundAnchorClickHandler = this.#anchorClickHandler.bind(this);
        this.#boundTransitionLayerEndHandler = this.#transitionLayerEndHandler.bind(this);
        this.#boundPageShowHandler = this.#pageShowHandler.bind(this);

        // scroll and parallax
        this.#boundScrollHandler = this.#scrollHandler.bind(this);
        this.#boundScrollParallax = this.#scrollParallax.bind(this);

        // mouse parallax
        this.#boundMouseParallaxHandler = this.#mouseParallaxHandler.bind(this);
        
        //this.#boundParallaxMoveHandler = this.#parallaxMoveHandler.bind(this);

        
        window.addEventListener("DOMContentLoaded", this.#boundApplicationDomLoadedHandler);
        window.addEventListener("load", this.#boundApplicationPageLoadedHandler);
        window.addEventListener("pageshow", this.#boundPageShowHandler);
        document.addEventListener("visibilitychange", this.#boundApplicationVisibilityChangeHandler);

        // overlay - dropdown
        document.addEventListener("click", AxialOverlayManager.documentOverlayClickHandler);
        document.addEventListener("click", AxialDropdownManager.documentDropdownClickHandler);
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
    get dataPath()
    {
        return this.#dataPath;
    }
    set dataPath( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#dataPath = value;
    }

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
     * Load data using the dataPath property if the page is loaded. The data property is filled with the result.
     * @private
     */
    async #loadData()
    {
        if( this.#dataPath === undefined ) { return; }

        try
        {
            const response = await fetch( this.#dataPath, { method: "GET" } );
            const json = await response.json();
            this.data = json;
            //console.log(json);
        }
        catch( err )
        {
            console.log(err);
        }
    }

    _loadData()
    {
        this.#loadData();
    }

    /**
     * This method is called once the data property has just been setted and before the AxialApplicationBase dispatches the dataChanged Custom Event.
     * @public
     * @abstract
     */
    _onApplicationDataChanged() {}

    ///
    /// PART: STATS
    ///

    get useStats() { return this.#useStats; }
    set useStats( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#useStats = value;
    }

    get statsPath() { return this.#statsPath; }
    set statsPath( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        // assumes it's the absolute path or the right path
        if( value.indexOf("http") === 0 || value.indexOf("../") === 0)
        {
            this.#statsPath = value;
        }
        else if( value.indexOf("./") === 0 )
        {
            const url = new URL( value, window.location.origin);
            this.#statsPath = url.href;
        }
        else
        {
            throw new Error("Stats path not correct");
        }
        
    }

    async #sendStats()
    {
        if( this.#statsSent === true ) { return; }
        //if( this.#statsObject.url.indexOf("http://localhost") === 0 || this.#statsObject.url.indexOf("https://localhost") === 0 ) { return; }
        try
        {
            if( this.#useStats === true && this.#statsPath !== undefined )
            {
                const statsDateEnd = new Date();
                this.#statsObject.dateEnd = new Date();
                const response = await fetch( this.#statsPath, { method: "POST", keepalive: true, body: JSON.stringify(this.#statsObject), headers: { "Content-Type":"application/json" } } );
                this.#statsSent = true;
            }
        }
        catch(err)
        {
            console.log("STATS ERROR");
            console.log(err);
        }
    }
    
    #applicationVisibilityChangeHandler( event )
    {
        if( document.visibilityState === "hidden" )
        {
            this.#sendStats();
        }
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

        // stats
        this.#statsObject.dom = true;

        // transition layer
        this.#transitionLayer = document.getElementById("axialTransitionLayer");
        if( this.#transitionLayer )
        {
            if( this.#usePageTransitions === false )
            {
                this.#transitionLayer.style.display = "none";
            }
            else
            {
                this.#transitionLayer.addEventListener("transitionend", this.#boundTransitionLayerEndHandler);
            }
        }

        // nav helper
        const anchors = document.getElementsByTagName("a");
        for( const anchor of anchors )
        {
            anchor.addEventListener("click", this.#boundAnchorClickHandler);
        }

        // scroll parallax
        this.#scrollParallaxHolder = document.getElementsByTagName("main")[0];
        this.#scrollParallaxSections = document.getElementsByTagName("section");

        ///
        /// UI
        ///

        // notifier
        this.#notifier = document.getElementById("axialNotifier");

        // notifier
        this.#informationBar = document.getElementById("axialInformationBar");

        // deletionOverlay
        this.#deletionOverlay = document.getElementById("axialDeletionOverlay");


        if( this.useScrollParallax === true )
        {
            this.#prepareParallax();
        }

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
    #applicationPageLoadedHandler( event )
    {
        // dom
        this.#applicationPageLoaded = true;

        // stats
        this.#statsObject.load = true;

        // consent
        AxialConsentManager.checkConsent();

        //  --> go to add parallax
        window.addEventListener("scroll", this.#boundScrollHandler);
        if( this.useScrollParallax === true )
        {
            window.requestAnimationFrame( this.#boundScrollParallax );
        }

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
    _onApplicationPageLoaded( event ) {}

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

    ///
    /// PART : RESIZE
    ///

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

    /**
     * @abstract
     */
    _onApplicationResize() {}

    ///
    /// PART: SCROLL PARALLAX
    ///

    get useScrollParallax() { return this.#useScrollParallax; }
    set useScrollParallax( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#useScrollParallax === value ) { return; }
        this.#useScrollParallax = value;

        if( this.#applicationPageLoaded === true && this.#useScrollParallax === true )
        {
            console.log("go for parallax");
        }
    }


    #scrollHandler( event )
    {
        if( this.#scrollParallaxHolder != undefined )
        {
            const scrollMax = this.#scrollParallaxHolder.offsetHeight - window.innerHeight;
            this.#scrollParallaxY = window.scrollY;
            this.#scrollParallaxRatio = this.#scrollParallaxY / scrollMax;
        }
    }

    #scrollParallax( ts )
    {
        // time calculation
        if( this.#scrollParallaxTimeStart === 0 )
        {
            this.#scrollParallaxTimeStart = ts;
            this.#scrollParallaxTimePrevious = ts;
        }
        const eTime = ts - this.#scrollParallaxTimeStart;
        const dTime = eTime - this.#scrollParallaxTimePrevious;
        this.#scrollParallaxTimePrevious = eTime;

        // sections
        const h = window.innerHeight;
        for( const section of this.#scrollParallaxSections )
        {
            const sectionBounds = section.getBoundingClientRect();

            // TODO Check what happens w/ sections larger than the height

            // outer ratio
            let outerSectionRatio = 0;
            if( sectionBounds.top >= h )
            {
                outerSectionRatio = 0;
            }
            else if( (sectionBounds.top + sectionBounds.height) <= 0 )
            {
                outerSectionRatio = 1;
            }
            else
            {
                outerSectionRatio = 1 - (sectionBounds.top + sectionBounds.height) / (sectionBounds.height + h );
            }

            // inner ratio
            let innerSectionRatio = 0;
            let innerBottomLimit = h / 2 + sectionBounds.height / 2;
            let innerTopLimit = h / 2 - sectionBounds.height / 2 - sectionBounds.height;

            if( sectionBounds.top >= innerBottomLimit )
            {
                innerSectionRatio = 0;
            }
            else if( sectionBounds.top <= innerTopLimit )
            {
                innerSectionRatio = 1;
            }
            else
            {
                innerSectionRatio = 1 - ( sectionBounds.top - innerTopLimit ) / ( 2 * sectionBounds.height );
            }

            const parallaxItems = section.getElementsByClassName("axial_parallax");            
            if( parallaxItems.length > 0 )
            {
                for( const item of parallaxItems )
                {
                    // ratio
                    let tempRatio = item.getAttribute("axial-parallax-ratio");
                    tempRatio = this.#parallaxRatios.has( tempRatio ) === true ? tempRatio : "outer";
                    
                    let itemRatio = tempRatio == "inner" ? innerSectionRatio : outerSectionRatio;

                    // unit
                    const unit = "px";

                    // mode
                    const mode = item.getAttribute("axial-parallax-mode");
                    if( mode == "in" && itemRatio > 0.5 ) { itemRatio = 0.5; }
                    if( mode == "out" && itemRatio < 0.5 ) { itemRatio = 0.5; }

                    // current translate
                    const currentTranslate = item.style.translate.replaceAll("px", "");
                    const currentTranslateValues = currentTranslate.split(" ");

                    // y
                    let finalY = 0;
                    const py = Number( item.getAttribute("axial-parallax-y") );
                    const cy = Number( currentTranslateValues[1] );
                    const ny = py - (2 * itemRatio) * py;
                    const fy = cy + ( ny - cy ) * dTime/200;
                    finalY = isNaN(fy) == true ? 0 : fy;

                    // x
                    let finalX = 0;
                    const px = Number( item.getAttribute("axial-parallax-x") );
                    const cx = Number( currentTranslateValues[0] );
                    const nx = px - (2 * itemRatio) * px;
                    const fx = cx + ( nx - cx ) * dTime/200;
                    finalX = isNaN(fx) == true ? 0 : fx;

                    // scale
                    let fscale = 1; // safer cause I'm coding at midnight
                    const tempScale = item.getAttribute("axial-parallax-scale");
                    const pscale = tempScale === null ? 1 : Number(tempScale);

                    if( pscale !=  1 )
                    {
                        const cscale = Number(item.style.scale);
                        const nscale = ((pscale - 1) * (1-2*itemRatio)) + 1;
                        const tfscale = cscale + ( nscale - cscale ) * dTime/200;
                        fscale = tfscale;
                    }
                    
                    const translate = String(finalX) + unit + " " + String(finalY) + unit;
                    const scale = fscale;

                    item.style.translate = translate;
                    item.style.scale = scale;
                }
            }

            if( this._onParallaxSectionChanged )
            {
                this._onParallaxSectionChanged( section, outerSectionRatio, innerSectionRatio, eTime, dTime );
            }
        }
        window.requestAnimationFrame( this.#boundScrollParallax );
    }

    #prepareParallax()
    {
        const parallaxItems = document.getElementsByClassName("axial_parallax");
        for( const item of parallaxItems )
        {
            const py = Number( item.getAttribute("axial-parallax-y") );
            const px = Number( item.getAttribute("axial-parallax-x") );
            
            const tempScale =  item.getAttribute("axial-parallax-scale") ;
            const pscale = tempScale === null ? 1 : tempScale;
            
            const translate = px + "px " + py + "px";
            const scale = pscale;

            item.style.translate = translate;
            item.style.scale = scale;
        }
    }

    /**
     * @abstract
     * @param { HTMLElement } section 
     * @param { Number } outer 
     * @param { Number } inner 
     * @param { Number } elapsed 
     * @param { Number } delta 
     */
    _onParallaxSectionChanged( section, outer, inner, elapsed, delta ) {}

    ///
    /// PART : MOUSE PARALLAX
    ///

    get useMouseParallax() { return this.#useMouseParallax; }
    set useMouseParallax( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#useMouseParallax === value ) { return; }
        this.#useMouseParallax = value;

        if( this.#applicationPageLoaded === true && this.#useMouseParallax === true )
        {
            document.addEventListener("pointermove", this.#boundMouseParallaxHandler);
        }
    }

    /**
     * 
     * @param {PointerEvent} event 
     */
    #mouseParallaxHandler( event )
    {
        if( event.pointerType != "mouse" ) { return; }
        const w = window.innerWidth;
        const h = window.innerHeight;
        const px = event.pageX;
        const py = event.pageY;
        const mx = ( px - w/2) / (w / 2);
        const my = ( py - h/2) / (h / 2);

        //console.log( event.pageX, event.pageY );

        if( this._onMouseParallax )
        {
            this._onMouseParallax( event, px, py, mx, my );
        }

    }

    _onMouseParallax( event, px, py, mx, my ) {}

    ///
    /// PART : TRANSITION LAYER
    ///

    /**
     * @readonly
     */
    get transitionLayer() { return this.#transitionLayer; }

    get usePageTransitions() { return this.#usePageTransitions; }
    set usePageTransitions( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#usePageTransitions === value ) { return; }
        this.#usePageTransitions = value;
    }

    get nextLocation() { return this.#nextLocation; }
    set nextLocation( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#nextLocation = value;
    }

    /**
     * 
     * @param { MouseEvent } event 
     */
    #anchorClickHandler( event )
    {
        if( event.currentTarget.href.indexOf("mailto:") == 0 ) { return; }
        if( event.currentTarget.href.indexOf("tel:") == 0 ) { return; }
        if( event.currentTarget.getAttribute("download") != null ) { return; }
        const url = new URL(event.currentTarget.href);

        if( window.location.hostname != url.hostname ) { return; }

        const hash = url.hash;
        if( hash != "" )
        {
            const sectionId = hash.split("#")[1];
            const section = document.getElementById(sectionId);
            const main = document.getElementsByTagName("main")[0];
            if( main )
            {
                event.preventDefault();
                const bounds = section.getBoundingClientRect();
                const scrollTopValue = bounds.y + window.scrollY;
                window.scrollTo( { left: 0, top: scrollTopValue, behavior: "smooth" } );
                return;
            }
        }
        
        // todo better here
        if( this.#usePageTransitions === true )
        {
            event.preventDefault();
            const href = event.currentTarget.href;
            if( href == window.location.href ) { return; }
            this.#nextLocation = href;
            
            if( this.#transitionLayer )
            {
                this.#transitionLayer.style.transform = "translateY(0%)";
            }
        }
    }

    #pageShowHandler( event )
    {
        if( this.#transitionLayer && this.#usePageTransitions === true )
        {
            this.#transitionLayer.style.transform = "translateY(-100%)";
        }
    }

    #transitionLayerEndHandler( event )
    {
        if( this.#transitionLayer )
        {
            const transform = this.#transitionLayer.style.transform;
            if( transform == "translateY(0%)" )
            {
                window.location.href = this.#nextLocation;
            }
        }
    }

    ///
    /// UI
    ///

    /// CONSENT
    /** 
     * @type { AxialConsentOverlay }
     * @readonly
     */
    get consentOverlay() { return this.#consentOverlay; }

    /** 
     * @type { AxialDeletionOverlay }
     * @readonly
     */
    get deletionOverlay() { return this.#deletionOverlay; }

    /// INFORMATION BAR
    /** 
     * @type { AxialInformationBar }
     * @readonly
     */
    get informationBar() { return this.#informationBar; }

    /// NOTIFIER
    /** 
     * @type { AxialNotifier }
     * @readonly
     */
    get notifier() { return this.#notifier; }

    /**
     * 
     * @param { String } message 
     */
    notify( message )
    {
        if( this.#notifier )
        {
            this.#notifier.show( message );
        }
    }
}

export { AxialApplicationBase }