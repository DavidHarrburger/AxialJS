"use strict"

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

    /** @type { Boolean } */
    #isBuilt = false;

    /** @type { Boolean } */
    #isShown = false;

    /** @type { HTMLElement } */
    #target = undefined;

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
        //console.log("overlaysLayer = " + overlaysLayer);
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
        this.#target = value;
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

    static get observedAttributes()
    {
        return [ "axial-target", "axial-position" ];
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
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
        
    }

    _finalizeComponent()
    {
        super._finalizeComponent();
        this.#buildComponent();
    }

    #buildComponent()
    {
        if( this.#isBuilt === true ) { return; }

        const tempTarget = this.getAttribute("axial-target");
        if( tempTarget )
        {
            const element = document.getElementById(tempTarget);
            if( element )
            {
                this.#target = element;
                this.#addOverlayHandlers();
                this.#isBuilt = true;
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
        console.log("overlay target clicked");
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
        if( !this.#target ) { return; }
        if( this.#isShown === true ) { return; }

        const overlayBounds = this.getBoundingClientRect();
        const targetBounds = this.#target.getBoundingClientRect();

        let overlayX;
        let overlayY;

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

            // bottom
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
        console.log("overlay show call");
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