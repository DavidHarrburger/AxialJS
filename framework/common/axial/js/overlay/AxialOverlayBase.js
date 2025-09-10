"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialOverlayManager } from "./AxialOverlayManager.js";

class AxialOverlayBase extends AxialComponentBase
{

    /** @type { Set } */
    #OVERLAY_POSITIONS = new Set( [ "bottom-left", "bottom-center", "bottom-right",
                                    "right-top", "right-center", "right-bottom",
                                    "top-left", "top-center", "top-right",
                                    "left-top", "left-center", "left-bottom" ] );

    #OVERLAY_SHOW_MODE = new Set( ["off", "over", "click"] );

    #OVERLAY_HIDE_MODE = new Set( ["off", "out", "click"] );

    #OVERLAY_DISPLAY_MODE = new Set( ["target", "window", "center"] );

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

    /** @type { String } */
    #showMode = "click";

    /** @type { String } */
    #hideMode = "click";

    /** @type { Number } */
    #offset = 10;

    /** @type { String } */
    #transform = "translate(0%, 0%)";

    /** @type { Boolean } */
    #useTransitions = true;

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

    /** @type { Boolean } */
    #useObfuscator = false;

    constructor()
    {
        super();
        this.classList.add("axial_overlay_base");
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

    get useObfuscator() { return this.#position; }
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
        return [ "axial-target", "axial-position", "axial-display" ];
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

    #transitionEndHandler( event )
    {
        if( this.#isShown === false )
        {
            this.style.visibility = "hidden";
        }
    }

    #addOverlayHandlers()
    {
        this.#target.addEventListener("pointerover", this.#boundOverlayTargetOverHandler);
        this.#target.addEventListener("pointerout", this.#boundOverlayTargetOutHandler);
        this.#target.addEventListener("click", this.#boundOverlayTargetClickHandler);
    }

    #removeOverlayHandlers()
    {
        this.#target.removeEventListener("pointerover", this.#boundOverlayTargetOverHandler);
        this.#target.removeEventListener("pointerout", this.#boundOverlayTargetOutHandler);
        this.#target.removeEventListener("click", this.#boundOverlayTargetClickHandler);
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

    #layoutOverlay()
    {
        if( !this.#target && this.#displayMode === "target" ) { return; }
        if( this.#isShown === true ) { return; }

        const overlayBounds = this.getBoundingClientRect();
        let overlayX;
        let overlayY;

        switch( this.#displayMode )
        {
            case "target":
                const targetBounds = this.#target.getBoundingClientRect();
                switch( this.#position )
                {
                    // bottom
                    case "bottom-left":
                        overlayY = targetBounds.bottom + this.#offset;
                        overlayX = targetBounds.left;
                    break;

                    case "bottom-center":
                        overlayY = targetBounds.bottom + this.#offset;
                        overlayX = targetBounds.left + (targetBounds.width / 2) - (overlayBounds.width / 2);
                    break;

                    case "bottom-right":
                        overlayY = targetBounds.bottom + this.#offset;
                        overlayX = targetBounds.right - overlayBounds.width;
                    break;

                    // right
                    case "right-top":
                        overlayX = targetBounds.right + this.#offset;
                        overlayY = targetBounds.top;
                    break;

                    case "right-center":
                        overlayX = targetBounds.right + this.#offset;
                        overlayY = targetBounds.top + (targetBounds.height / 2) - (overlayBounds.height / 2);
                    break;

                    case "right-bottom":
                        overlayX = targetBounds.right + this.#offset;
                        overlayY = targetBounds.bottom - overlayBounds.height;
                    break;

                    // top
                    case "top-left":
                        overlayY = targetBounds.top - this.#offset - overlayBounds.height;
                        overlayX = targetBounds.left;
                    break;

                    case "top-center":
                        overlayY = targetBounds.top - this.#offset - overlayBounds.height;
                        overlayX = targetBounds.left + (targetBounds.width / 2)- (overlayBounds.width / 2);
                    break;

                    case "top-right":
                        overlayY = targetBounds.top - this.#offset - overlayBounds.height;
                        overlayX = targetBounds.right - overlayBounds.width;
                    break;

                    // left
                    case "left-top":
                        overlayX = targetBounds.left - this.#offset - overlayBounds.width;
                        overlayY = targetBounds.top;
                    break;

                    case "left-center":
                        overlayX = targetBounds.left - this.#offset - overlayBounds.width;
                        overlayY = targetBounds.top + (targetBounds.height / 2)- (overlayBounds.height / 2);
                    break;

                    case "left-bottom":
                        overlayX = targetBounds.left - this.#offset - overlayBounds.width;
                        overlayY = targetBounds.bottom - overlayBounds.height;
                    break;
                }
            break;

            case "window":
                const ww = window.innerWidth;
                const wh = window.innerHeight;
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

            default:
                overlayX = 0;
                overlayY = 0;
            break;
        }

        this.style.left = String(overlayX) + "px";
        this.style.top = String(overlayY) + "px";

        if( this.#useTransitions === true )
        {
            const transformDirection = this.#position.split("-")[0];
            switch( transformDirection )
            {
                case "bottom" : this.#transform = "translate(0%, 20%)";  break;
                case "top" :    this.#transform = "translate(0%, -20%)"; break;
                case "left" :   this.#transform = "translate(-20%, 0%)"; break;
                case "right" :  this.#transform = "translate(20%, 0%)";  break;
                default:        this.#transform = "translate(0%, 0%)";   break;
            }

            this.style.opacity = "0";
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
        if( this.#isShown === true ) { return; }
        this.#layoutOverlay();
        this.style.visibility = "visible";
        this.#isShown = true;
        if( this.useTransitions === true )
        {
            this.style.transitionProperty = "opacity, transform";
            this.style.opacity = "1";
            this.style.transform = "translate(0%, 0%)";
        }

        if( this.#useObfuscator === true )
        {
            const oo = document.getElementById("overlayObfuscator");
            if( oo )
            {
                oo.style.visibility = "visible";
            }
        }
    }

    hide()
    {
        if( this.#isShown === false ) { return; }
        this.#isShown = false;
        if( this.useTransitions === true )
        {
            this.style.opacity = "0";
            this.style.transform = this.#transform;
        }
        else
        {
            this.style.visibility = "hidden";
        }

        if( this.#useObfuscator === true )
        {
            const oo = document.getElementById("overlayObfuscator");
            if( oo )
            {
                oo.style.visibility = "hidden";
            }
        }
    }

    /**
     * @private
     * Prevent the popup from being closed if user click outside of its DOMRect
     * @param { PointerEvent } event 
     */
    #overlayClickHandler( event ) { event.stopImmediatePropagation(); }
}

window.customElements.define("axial-overlay-base", AxialOverlayBase);
export { AxialOverlayBase }