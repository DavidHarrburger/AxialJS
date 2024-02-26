"use strict"

import { LanguageUtils } from "../utils/LanguageUtils.js";

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
    #language = undefined;

    ///
    /// SCROLL PARALLAX
    ///

    /// parallax elements
    
    /**
     * The main container / holder we use to calculte the parallax regarding the scroll
     * Default looking for the 'main' tag of the page
     * Even it's a little bit opiniated, you should not really have to change it
     * @type { HTMLElement }
     */
    #scrollParallaxHolder;

    /** @type { HTMLCollection } */
    #scrollParallaxSections;

    /// parallax vars
    /**
     * @type { Boolean }
     */
    #useScrollParallax = false;

    /**
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

        // scroll and parallax
        this.#boundScrollHandler = this.#scrollHandler.bind(this);
        this.#boundScrollParallax = this.#scrollParallax.bind(this);
        
        //this.#boundParallaxMoveHandler = this.#parallaxMoveHandler.bind(this);
        
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
        // to check
        /*
        if( this.#applicationPageLoaded === true )
        {
            this.#loadData;
        }
        */
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
    _onApplicationDataChanged()
    {
        console.log("AxialApplicationBase._onApplicationDataChanged()");
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
        
        // scroll parallax
        this.#scrollParallaxHolder = document.getElementsByTagName("main")[0];
        this.#scrollParallaxSections = document.getElementsByTagName("section");

        console.log( "this.useScrollParallax = " + this.useScrollParallax);
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
    #applicationPageLoadedHandler(event)
    {
        this.#applicationPageLoaded = true;

        // parallax
        window.addEventListener("scroll", this.#boundScrollHandler);
        /*
        if( this.#dataPath !== undefined )
        {
            this.#loadData();
        }*/

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
        //console.log("AxialApplicationBase._onApplicationResize()");
    }

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
                sectionRatio = 0;
                outerSectionRatio = 0;
            }
            else if( (sectionBounds.top + sectionBounds.height) <= 0 )
            {
                sectionRatio = 1;
                outerSectionRatio = 1;
            }
            else
            {
                sectionRatio = 1 - (sectionBounds.top + sectionBounds.height) / (sectionBounds.height + h );
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

    _onParallaxSectionChanged( section, outer, inner, elapsed, delta )
    {

    }
}

export { AxialApplicationBase }