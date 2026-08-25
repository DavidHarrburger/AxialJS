"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialInputBase } from "../core/AxialInputBase.js";
import { AxialOverlayManager } from "./AxialOverlayManager.js";

class AxialOverlayBase extends AxialComponentBase
{

    /// vars
    /** @type { Set } */
    #OVERLAY_POSITIONS = new Set( [ "bottom-left", "bottom-center", "bottom-right",
                                    "right-top", "right-center", "right-bottom",
                                    "top-left", "top-center", "top-right",
                                    "left-top", "left-center", "left-bottom" ] );

    #OVERLAY_SHOW_MODE = new Set( ["off", "over", "click"] );

    #OVERLAY_HIDE_MODE = new Set( ["off", "out", "click" ] );

    #OVERLAY_DISPLAY_MODE = new Set( ["target", "window", "center", "context"] );

    /** @type { Boolean } */
    #isShown = false;

    /** @type { HTMLElement } */
    #target = undefined;

    /** @type { Boolean } */
    #isModal = false;

    /** @type { String } */
    #displayMode = "target";

    /** @type { String } */
    #position = "bottom-left";

    /** @type { Boolean } */
    #isPlaying = false;

    /** @type { String } */
    #showMode = "click";

    /** @type { String } */
    #hideMode = "click";

    /** @type { Number } */
    #offset = 10;

    /** @type { Number } */
    #offsetBounds = 40;

    /** @type { String } */
    #transform = "translate(0%, 0%)";

    /** @type { Number } */
    #transformDecay = 10;

    /** @type { Boolean } */
    #useTransitions = true;

    /** @type { Boolean } */
    #useObfuscator = false;

    /** @type { Boolean } */
    #useOpacity = true;

    /** @type { Boolean } */
    #allowStack = false;

    /** @type { String } */
    #obfuscatorId = "axialOverlayObfuscator";

    /** @type { PointerEvent } */
    #contextPointerEvent;

    /** @type { HTMLElement } */
    #contextInitializer;

    /// events
    /** @type { Function } */
    #boundTransitionEndHandler;

    /** @type { Function } */
    #boundOverlayTargetOverHandler;

    /** @type { Function } */
    #boundOverlayTargetOutHandler;

    /** @type { Function } */
    #boundOverlayTargetClickHandler;

    /** @type { Function } */
    #boundOverlayClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_overlay_base");

        this.isResizable = true;
        
        // HTMLElement
        this.#boundOverlayTargetOverHandler = this.#overlayTargetOverHandler.bind(this);
        this.#boundOverlayTargetOutHandler = this.#overlayTargetOutHandler.bind(this);
        this.#boundOverlayTargetClickHandler = this.#overlayTargetClickHandler.bind(this);

        this.#boundOverlayClickHandler = this.#overlayClickHandler.bind(this);
        
        this.#boundTransitionEndHandler = this.#transitionEndHandler.bind(this);

        this.addEventListener("click", this.#boundOverlayClickHandler);
        AxialOverlayManager.OVERLAYS.add(this);

        const overlaysLayer = AxialOverlayManager.LAYER;
        if( overlaysLayer && overlaysLayer.contains(this) === false )
        {
            overlaysLayer.appendChild(this) ;
        }
    }

    /**
     * @type { Boolean }
     * @public
     * @readonly
     */
    get isShown() { return this.#isShown; }

    /**
     * @type { Boolean }
     * @public
     * @readonly
     */
    get isPlaying() { return this.#isPlaying; }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get contextInitializer() { return this.#contextInitializer; }

    get target() { return this.#target; }
    set target( value )
    {
        // do control here
        //console.log("overlay target setter");
        //console.log( value instanceof HTMLElement );
        if( value instanceof HTMLElement === false )
        {
            throw new TypeError("HTMLElement value required");
        }
        if( value == this.#target ) { return; }
        if( this.#target !== undefined )
        {
            this.#removeOverlayHandlers();
        }
        this.#target = value;
        this.#layoutOverlay();
        this.#addOverlayHandlers();
    }

    get transformDecay() { return this.#transformDecay; }
    set transformDecay( value )
    {
        if( isNaN( value) === true ) { throw new TypeError("Number value required"); }

        this.#transformDecay = value;
        this.#layoutOverlay();
    }

    removeTarget()
    {
        this.#removeOverlayHandlers();
        this.#target = undefined;
    }

    get position() { return this.#position; }
    set position( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        if( this.#OVERLAY_POSITIONS.has( value ) === true )
        {
            this.#position = value;
        }
        
        this.#layoutOverlay();
    }

    get isModal() { return this.#isModal; }
    set isModal( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#isModal = value;
    }

    get displayMode() { return this.#displayMode; }
    set displayMode( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        if( this.#OVERLAY_DISPLAY_MODE.has( value ) === true )
        {
            this.#displayMode = value;
        }
        this.#layoutOverlay();
    }

    get useObfuscator() { return this.#useObfuscator; }
    set useObfuscator( value )
    {
        if( this.#isShown === true ) { return; }
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( value !== this.#useObfuscator )
        {
            this.#useObfuscator = value;
        }
    }

    get useObfuscator() { return this.#useObfuscator; }
    set useObfuscator( value )
    {
        if( this.#isShown === true ) { return; }
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( value !== this.#useObfuscator )
        {
            this.#useObfuscator = value;
        }
    }

    get useOpacity() { return this.#useOpacity; }
    set useOpacity( value )
    {
        if( this.#isShown === true ) { return; }
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( value !== this.#useOpacity )
        {
            this.#useOpacity = value;
        }
    }

    get allowStack() { return this.#allowStack; }
    set allowStack( value )
    {
        //if( this.#isShown === true ) { return; }
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( value !== this.#allowStack )
        {
            this.#allowStack = value;
        }
    }



    get showMode() { return this.#showMode; }
    set showMode( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        if( this.#OVERLAY_SHOW_MODE.has( value ) === true )
        {
            this.#showMode = value;
        }
    }

    get hideMode() { return this.#hideMode; }
    set hideMode( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        if( this.#OVERLAY_HIDE_MODE.has( value ) === true )
        {
            this.#hideMode = value;
        }
    }

    get useTransitions() { return this.#useTransitions; }
    set useTransitions( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }

        this.#useTransitions = value;
    }

    get offset() { return this.#offset; }
    set offset( value )
    {
        if( isNaN( value ) === true  )
        {
            throw new TypeError("Number value required");
        }
        this.#offset = value;
    }

    static get observedAttributes()
    {
        return [ "axial-target", "axial-position", "axial-display", "axial-offset" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-target" )
        {
            const element = document.getElementById(newValue);
            if( element )
            {
                this.#target = element;
            }
        }

        if( name === "axial-position" )
        {
            this.position = newValue;
        }

        if( name === "axial-display" )
        {
            this.displayMode = newValue;
        }

        if( name === "axial-offset" )
        {
            const tempOffset = Number( newValue );
            if( isNaN(tempOffset) === false && tempOffset > 0 )
            {
                this.offset = tempOffset;
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        const tempTarget = this.getAttribute("axial-target");
        if( tempTarget )
        {
            const element = document.getElementById(tempTarget);
            if( element )
            {
                this.#target = element;
                this.#addOverlayHandlers();
            }
        }

        const tempPosition = this.getAttribute("axial-position");
        if( tempPosition !== null )
        {
            this.position = tempPosition;
        }

        this.addEventListener("transitionend", this.#boundTransitionEndHandler);
    }

    /**
     * 
     * @param { TransitionEvent } event 
     */
    #transitionEndHandler( event )
    {

        if( event.propertyName === "transform" )
        {
            if( this.#isShown === false )
            {
                console.log("hidden")
                this.style.visibility = "hidden";
                this._onHidden();
                const overlayEvent = new CustomEvent("overlayHidden");
                this.dispatchEvent( overlayEvent );
            }
            else
            {
                this._onShown();
                const overlayEvent = new CustomEvent("overlayShown");
                this.dispatchEvent( overlayEvent );
            }
        }
        this.#isPlaying = false;
    }

    #addOverlayHandlers()
    {
        if( this.#target instanceof AxialInputBase === false )
        {
            this.#target.addEventListener("pointerover", this.#boundOverlayTargetOverHandler);
            this.#target.addEventListener("pointerout", this.#boundOverlayTargetOutHandler);
            this.#target.addEventListener("click", this.#boundOverlayTargetClickHandler);
        }
    }

    #removeOverlayHandlers()
    {
        if( this.#target instanceof AxialInputBase === false )
        {
            this.#target.removeEventListener("pointerover", this.#boundOverlayTargetOverHandler);
            this.#target.removeEventListener("pointerout", this.#boundOverlayTargetOutHandler);
            this.#target.removeEventListener("click", this.#boundOverlayTargetClickHandler);
        }
    }

    #overlayTargetOverHandler( event )
    {
        if( this.#showMode === "over" )
        {
            this.show();
        }
    }

    #overlayTargetOutHandler( event )
    {
        if( this.#hideMode === "out" )
        {
            this.hide();
        }
    }

    /**
     * @param { MouseEvent } event 
     */
    #overlayTargetClickHandler( event )
    {
        event.stopPropagation();
        if( this.#showMode === "click" && this.#isShown === false )
        {
            this.show();
            for( const overlay of AxialOverlayManager.OVERLAYS )
            {
                if( overlay.hideMode === "click" && overlay !== this )
                {
                    overlay.hide();
                }
            }
        }
        else if( this.#hideMode === "click" && this.#isShown === true )
        {
            this.hide();
        }
    }

    _resize()
    {
        if( this.#isShown === false ) { return; }
        this.#layoutOverlay();
    }

    #layoutOverlay()
    {
        if( !this.#target && this.#displayMode === "target" ) { return; }
        //if( this.#isShown === true ) { return; }

        const overlayBounds = this.getBoundingClientRect();
        let overlayX;
        let overlayY;

        let ww = window.innerWidth;
        let wh = window.innerHeight;

        switch( this.#displayMode )
        {
            case "target":
                const targetBounds = this.#target.getBoundingClientRect();
                switch( this.#position )
                {
                    // bottom
                    case "bottom-left":
                        // x
                        overlayX = targetBounds.left;
                        if( (overlayX + overlayBounds.width) > (ww - this.#offsetBounds) )
                        {
                            overlayX = targetBounds.right - overlayBounds.width;
                        }
                        // y
                        overlayY = targetBounds.bottom + this.#offset;
                        if( (overlayY + overlayBounds.height) > (wh - this.#offsetBounds) )
                        {
                            overlayY = targetBounds.top - this.#offset - overlayBounds.height;
                        }
                        
                    break;

                    case "bottom-center":
                        // x
                        overlayX = targetBounds.left + (targetBounds.width / 2) - (overlayBounds.width / 2);
                        if( overlayX < this.#offsetBounds )
                        {
                            overlayX = targetBounds.left;
                        }
                        else if( (overlayX + overlayBounds.width) > (ww - this.#offsetBounds) )
                        {
                            overlayX = targetBounds.right - overlayBounds.width;
                        }

                        // y
                        overlayY = targetBounds.bottom + this.#offset;
                        if( (overlayY + overlayBounds.height) > (wh - this.#offsetBounds) )
                        {
                            overlayY = targetBounds.top - this.#offset - overlayBounds.height;
                        }
                        

                    break;

                    case "bottom-right":
                        // x
                        overlayX = targetBounds.right - overlayBounds.width;
                        if( overlayX < this.#offsetBounds )
                        {
                            overlayX = targetBounds.left;
                        }

                        // y
                        overlayY = targetBounds.bottom + this.#offset;
                        if( (overlayY + overlayBounds.height) > (wh - this.#offsetBounds) )
                        {
                            overlayY = targetBounds.top - this.#offset - overlayBounds.height;
                        }
                        
                    break;

                    // right
                    case "right-top":
                        // x
                        overlayX = targetBounds.right + this.#offset;
                        if( (overlayX + overlayBounds.width) > ( ww - this.#offsetBounds) )
                        {
                            overlayX = targetBounds.left - this.#offset - overlayBounds.width;
                        }

                        // y
                        overlayY = targetBounds.top;
                        if( (overlayY + overlayBounds.height) > (wh - this.#offsetBounds) )
                        {
                            overlayY = targetBounds.bottom - overlayBounds.height;
                        }
                        
                    break;

                    case "right-center":
                        // x
                        overlayX = targetBounds.right + this.#offset;
                        if( (overlayX + overlayBounds.width) > ( ww - this.#offsetBounds) )
                        {
                            overlayX = targetBounds.left - this.#offset - overlayBounds.width;
                        }

                        // y
                        overlayY = targetBounds.top + (targetBounds.height / 2) - (overlayBounds.height / 2);
                        if( overlayY < this.#offsetBounds )
                        {
                            overlayY = targetBounds.top;
                        }
                        else if( (overlayY + overlayBounds.height) > (wh - this.#offsetBounds) )
                        {
                            overlayY = targetBounds.bottom - overlayBounds.height;
                        }

                    break;

                    case "right-bottom":
                        // x
                        overlayX = targetBounds.right + this.#offset;
                        if( (overlayX + overlayBounds.width) > ( ww - this.#offsetBounds) )
                        {
                            overlayX = targetBounds.left - this.#offset - overlayBounds.width;
                        }
                        // y
                        overlayY = targetBounds.bottom - overlayBounds.height;
                        if( overlayY < this.#offsetBounds )
                        {
                            overlayY = targetBounds.top;
                        }

                    break;

                    // top
                    case "top-left":
                        // x
                        overlayX = targetBounds.left;
                        if( (overlayX + overlayBounds.width) > (ww - this.#offsetBounds) )
                        {
                            overlayX = targetBounds.right - overlayBounds.width;
                        }

                        // y
                        overlayY = targetBounds.top - this.#offset - overlayBounds.height;
                        if( overlayY < this.#offsetBounds )
                        {
                            overlayY = targetBounds.bottom + this.#offset;
                        }
                    break;

                    case "top-center":
                        // x
                        overlayX = targetBounds.left + (targetBounds.width / 2)- (overlayBounds.width / 2);
                        if( overlayX < this.#offsetBounds )
                        {
                            overlayX = targetBounds.left;
                        }
                        else if( (overlayX + overlayBounds.width) > (ww - this.#offsetBounds) )
                        {
                            overlayX = targetBounds.right - overlayBounds.width;
                        }

                        // y
                        overlayY = targetBounds.top - this.#offset - overlayBounds.height;
                        if( overlayY < this.#offsetBounds )
                        {
                            overlayY = targetBounds.bottom + this.#offset;
                        }
                        
                    break;

                    case "top-right":
                        // x
                        overlayX = targetBounds.right - overlayBounds.width;
                        if( overlayX < this.#offsetBounds )
                        {
                            overlayX = targetBounds.left;
                        }

                        // y
                        overlayY = targetBounds.top - this.#offset - overlayBounds.height;
                        if( overlayY < this.#offsetBounds )
                        {
                            overlayY = targetBounds.bottom + this.#offset;
                        }
                        
                    break;

                    // left
                    case "left-top":
                        // x
                        overlayX = targetBounds.left - this.#offset - overlayBounds.width;
                        if( overlayX < this.#offsetBounds )
                        {
                            overlayX = targetBounds.right + this.#offset;
                        }
                        // y
                        overlayY = targetBounds.top;
                        if( (overlayY + overlayBounds.height) > (wh - this.#offsetBounds) )
                        {
                            overlayY = targetBounds.bottom - overlayBounds.height;
                        }
                    break;

                    case "left-center":
                        // x
                        overlayX = targetBounds.left - this.#offset - overlayBounds.width;
                        if( overlayX < this.#offsetBounds )
                        {
                            overlayX = targetBounds.right + this.#offset;
                        }
                        // y
                        overlayY = targetBounds.top + (targetBounds.height / 2) - (overlayBounds.height / 2);
                        if( overlayY < this.#offsetBounds )
                        {
                            overlayY = targetBounds.top;
                        }
                        else if( (overlayY + overlayBounds.height) > (wh - this.#offsetBounds) )
                        {
                            overlayY = targetBounds.bottom - overlayBounds.height;
                        }
                    break;

                    case "left-bottom":
                        // x
                        overlayX = targetBounds.left - this.#offset - overlayBounds.width;
                        if( overlayX < this.#offsetBounds )
                        {
                            overlayX = targetBounds.right + this.#offset;
                        }

                        // y
                        overlayY = targetBounds.bottom - overlayBounds.height;
                        if( overlayY < this.#offsetBounds )
                        {
                            overlayY = targetBounds.top;
                        }
                    break;
                }
            break;

            case "window":
                switch( this.#position )
                {
                    // bottom
                    case "bottom-left":
                        overlayY = wh - overlayBounds.height - this.#offset;
                        overlayX = this.#offset;
                    break;

                    case "bottom-center":
                        overlayY = wh - overlayBounds.height - this.#offset;
                        overlayX = ( ww - overlayBounds.width ) / 2;
                    break;

                    case "bottom-right":
                        overlayY = wh - overlayBounds.height - this.#offset;
                        overlayX = ww - overlayBounds.width - this.#offset;
                    break;

                    // right TODO
                    case "right-top":
                        overlayX = ww - overlayBounds.width - this.#offset;
                        overlayY = this.#offset;
                    break;

                    case "right-center":
                        overlayX = ww - overlayBounds.width - this.#offset;
                        overlayY = ( wh - overlayBounds.height ) / 2;
                    break;

                    case "right-bottom":
                        overlayX = ww - overlayBounds.width - this.#offset;
                        overlayY = wh - overlayBounds.height - this.#offset;
                    break;

                    // top TODO
                    case "top-left":
                        overlayY = this.#offset;
                        overlayX = this.#offset;
                    break;

                    case "top-center":
                        overlayY = this.#offset;
                        overlayX = ( ww - overlayBounds.width ) / 2;
                    break;

                    case "top-right":
                        overlayY = this.#offset;
                        overlayX = ww - overlayBounds.width - this.#offset;
                    break;

                    // left TODO
                    case "left-top":
                        overlayX = this.#offset;
                        overlayY = this.#offset;
                    break;

                    case "left-center":
                        overlayX = this.#offset;
                        overlayY = ( wh - overlayBounds.height ) / 2;
                    break;

                    case "left-bottom":
                        overlayX = this.#offset;
                        overlayY = targetBounds.bottom - overlayBounds.height;
                    break;
                }
            break;

            case "center":
                const wwc = window.innerWidth;
                const whc = window.innerHeight;
                overlayX = ( wwc - overlayBounds.width ) / 2;
                overlayY = ( whc - overlayBounds.height ) / 2;
            break;

            case "context":
                /// to check
                const wwm = window.innerWidth;
                const whm = window.innerHeight;

                const contextCallX = this.#contextPointerEvent?.pageX || 0;
                const contextCallY = this.#contextPointerEvent?.pageY || 0;

                overlayX = contextCallX <= ( wwm / 2 ) ? contextCallX : (contextCallX - overlayBounds.width);
                overlayY = contextCallY <= ( whm / 2 ) ? contextCallY : (contextCallY - overlayBounds.height);

            break;

            default:
                overlayX = 0;
                overlayY = 0;
            break;
        }

        this.style.left = String(overlayX) + "px";
        this.style.top = String(overlayY) + "px";

        if( this.#isShown === true ) { return; }

        if( this.#useTransitions === true )
        {
            let transformDirection = this.#position.split("-")[0];
            switch( transformDirection )
            {
                case "bottom" : this.#transform = `translate(0%, ${this.#transformDecay}%)`;  break;
                case "top" :    this.#transform = `translate(0%, -${this.#transformDecay}%)`; break;
                case "left" :   this.#transform = `translate(-${this.#transformDecay}%, 0%)`; break;
                case "right" :  this.#transform = `translate(${this.#transformDecay}%, 0%)`;  break;
                default:        this.#transform = "translate(0%, 0%)";   break;
            }

            this.style.opacity = this.#useOpacity === true ? "0" : "1";
            this.style.transform = this.#transform;
        }
        else
        {
            this.style.transitionProperty = "none";
            this.#transform = "translate(0%, 0%)";
            this.style.opacity = "1";
            this.style.transform = this.#transform;
        }
    }

    show()
    {
        if( this.#isPlaying === true ) { return; }
        if( this.#isShown === true ) { return; }
        if( !this.#target && this.#displayMode === "target" ) { return; }
        
        this._onShowing();
        this.#layoutOverlay();
        this.style.visibility = "visible";
        this.#isShown = true;
        if( this.useTransitions === true )
        {
            this.#isPlaying = true;
            const tp = this.#useOpacity === true ? "opacity, transform" : "transform";
            this.style.transitionProperty = tp;
            this.style.opacity = "1";
            this.style.transform = "translate(0%, 0%)";
        }

        if( this.#useObfuscator === true )
        {
            const oo = document.getElementById( this.#obfuscatorId );
            if( oo )
            {
                oo.style.visibility = "visible";
            }
        }
    }

    hide()
    {
        if( this.#isPlaying === true ) { return; }
        if( this.#isShown === false ) { return; }
        
        this.#isShown = false;
        
        if( this.useTransitions === true )
        {
            this.#isPlaying = true;
            this.style.opacity = this.#useOpacity === true ? "0" : "1";
            this.style.transform = this.#transform;
        }
        else
        {
            this._onHidden();
            const overlayEvent = new CustomEvent("overlayHidden");
            this.dispatchEvent( overlayEvent );
        }

        if( this.#useObfuscator === true )
        {
            const oo = document.getElementById( this.#obfuscatorId );
            if( oo )
            {
                oo.style.visibility = "hidden";
            }
        }
    }

    /**
     * 
     * @param { HTMLElement } target 
     * @param { PointerEvent } event 
     * @returns 
     */
    showAtTarget( target, event )
    {
        if( target instanceof HTMLElement === false ) { throw new TypeError("HTMLElement value required"); }
        if( event instanceof PointerEvent === false && event instanceof FocusEvent === false ) { throw new TypeError("PointerEvent or FocusEvent value required"); }

        if( this.#target === target && this.#target instanceof AxialInputBase === false )
        {
            //console.log("listeners are here so nothing to do in theory");
            return;
        }
        else
        {
            // we check if we the overlay is shown
            if( this.#isShown === true )
            {
                //console.log("overlay is shown, we need to hide it first");
                const tempUseTransitions = this.#useTransitions;
                this.#useTransitions = false;
                //console.log("Input come from here ???")
                this.hide();
                this.#useTransitions = tempUseTransitions;
            }

            if( this.#target !== undefined )
            {
                this.#removeOverlayHandlers();
            }

            if( event instanceof PointerEvent && event.type === "click" )
            {
                event.stopPropagation();
            }

            // now we set the new target
            this.#target = target;
            this.#addOverlayHandlers();
            this.#layoutOverlay();
            this.show();
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    showAsContext( event, initializer )
    {
        //console.log("SHHOW_AS_CONTEXT");
        if( event instanceof PointerEvent === false ) { throw new TypeError("PointerEvent value required"); }
        this.#contextInitializer = initializer;
        this.#contextPointerEvent = event;
        console.log(event);
        if( this.#isShown === true )
        {
            const tempUseTransitions = this.#useTransitions;
            this.#useTransitions = false;
            this.hide();
            this.#useTransitions = tempUseTransitions;
        }
        this.show();
        console.log("context menu endpoint");
    }

    /**
     * @private
     * Prevent the popup from being closed if user click outside of its DOMRect
     * @param { PointerEvent } event 
     */
    #overlayClickHandler( event )
    {
        //console.log("overlay click");
        event.stopImmediatePropagation();
    }

    /**
     * @abstract
     */
    _onShowing() {};

    /**
     * @abstract
     */
    _onShown() {};

    /**
     * @abstract
     */
    _onHidden() {};
}

window.customElements.define("axial-overlay-base", AxialOverlayBase);
export { AxialOverlayBase }