"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialTooltipManager } from "./AxialTooltipManager.js";

class AxialTooltipBase extends AxialComponentBase
{
    /** @type { Set } */
    #TOOLTIP_POSITIONS = new Set( [ "bottom-left", "bottom-center", "bottom-right",
                                    "right-top", "right-center", "right-bottom",
                                    "top-left", "top-center", "top-right",
                                    "left-top", "left-center", "left-bottom" ] );

    /** @type { Boolean } */
    #isShown = false;

    /** @type { HTMLElement } */
    #target = undefined;

    /** @type { String } */
    #position = "bottom-center";

    /** @type { Number } */
    #offset = 4;

    /** @type { Number } */
    #initWidth = 0;

    /** @type { Number } */
    #initHeight = 0;

    /** @type { String } */
    #transformOrigin = "center top";

    /** @type { Boolean } */
    #useTransitions = true;

    /** @type { Function } */
    #boundTransitionEndHandler;

    /** @type { Function } */
    #boundTooltipTargetOverHandler;

    /** @type { Function } */
    #boundTooltipTargetOutHandler;

    /** @type { Function } */
    #boundTooltipTargetClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_tooltip_base");
        this.#boundTooltipTargetOverHandler = this.#tooltipTargetOverHandler.bind(this);
        this.#boundTooltipTargetOutHandler = this.#tooltipTargetOutHandler.bind(this);
        
        this.#boundTransitionEndHandler = this.#transitionEndHandler.bind(this);

        /*
        AxialTooltipManager.TOOLTIPS.add(this);

        console.log(AxialTooltipManager.LAYER)

        const tooltipLayer = AxialTooltipManager.LAYER;
        console.log("tooltipLayer = " + tooltipLayer);
        if( tooltipLayer && tooltipLayer.contains(this) === false )
        {
            tooltipLayer.appendChild(this) ;
        }
        */
    }

    addTooltip()
    {
        AxialTooltipManager.TOOLTIPS.add(this);
        const tooltipLayer = AxialTooltipManager.LAYER;
        if( tooltipLayer && tooltipLayer.contains(this) === false )
        {
            tooltipLayer.appendChild(this) ;
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
        if( value instanceof HTMLElement === false )
        {
            throw new Error("HTMLElement value expected")
        }
        if( this.#target != undefined )
        {
            this.#removeTooltipHandlers();
        }
        this.#target = value;
        
        // not super but fix the scale init "problem"
        const initBounds = this.getBoundingClientRect();
        this.#initWidth = initBounds.width;
        this.#initHeight = initBounds.height;

        this.style.transform = "scale(0)";
        
        this.#layoutTooltip();
        this.#addTooltipHandlers();
    }

    get position() { return this.#position; }
    set position( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        if( this.#TOOLTIP_POSITIONS.has( value ) === true )
        {
            this.#position = value;
        }
        
        this.#layoutTooltip();
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
                this.#addTooltipHandlers();
            }
        }

        const tempPosition = this.getAttribute("axial-position");
        if( tempPosition !== null )
        {
            this.position = tempPosition;
        }

        const initBounds = this.getBoundingClientRect();
        this.#initWidth = initBounds.width;
        this.#initHeight = initBounds.height;

        this.addEventListener("transitionend", this.#boundTransitionEndHandler);
    }

    #transitionEndHandler( event )
    {
        if( this.#isShown === false )
        {
            this.style.visibility = "hidden";
        }
    }

    #addTooltipHandlers()
    {
        this.#target.addEventListener("pointerenter", this.#boundTooltipTargetOverHandler);
        this.#target.addEventListener("pointerleave", this.#boundTooltipTargetOutHandler);
    }

    #removeTooltipHandlers()
    {
        this.#target.removeEventListener("pointerenter", this.#boundTooltipTargetOverHandler);
        this.#target.removeEventListener("pointerleave", this.#boundTooltipTargetOutHandler);
    }

    /**
     * @param { PointerEvent } event 
     */
    #tooltipTargetOverHandler( event )
    {
        this.show();
    }

    /**
     * @param { PointerEvent } event 
     */
    #tooltipTargetOutHandler( event )
    {
        this.hide();
    }

    #layoutTooltip()
    {
        if( this.#isShown === true ) { return; }

        const tooltipBounds = this.getBoundingClientRect();
        const targetBounds = this.#target.getBoundingClientRect();

        let tooltipX;
        let tooltipY;

        switch( this.#position )
        {
            // bottom
            case "bottom-left":
                tooltipY = targetBounds.bottom + this.#offset;
                tooltipX = targetBounds.left;
                this.#transformOrigin = "left top";
            break;

            case "bottom-center":
                tooltipY = targetBounds.bottom + this.#offset;
                tooltipX = targetBounds.left + (targetBounds.width / 2) - (this.#initWidth / 2);
                this.#transformOrigin = "center top";
            break;

            case "bottom-right":
                tooltipY = targetBounds.bottom + this.#offset;
                tooltipX = targetBounds.right - this.#initWidth;
                this.#transformOrigin = "right top";
            break;

            // right
            case "right-top":
                tooltipX = targetBounds.right + this.#offset;
                tooltipY = targetBounds.top;
                this.#transformOrigin = "left top";
            break;

            case "right-center":
                tooltipX = targetBounds.right + this.#offset;
                tooltipY = targetBounds.top + (targetBounds.height / 2) - (this.#initHeight / 2);
                this.#transformOrigin = "left center";
            break;

            case "right-bottom":
                tooltipX = targetBounds.right + this.#offset;
                tooltipY = targetBounds.bottom - this.#initHeight;
                this.#transformOrigin = "left bottom";
            break;

            // top
            case "top-left":
                tooltipY = targetBounds.top - this.#offset - this.#initHeight;
                tooltipX = targetBounds.left;
                this.#transformOrigin = "left bottom";
            break;

            case "top-center":
                tooltipY = targetBounds.top - this.#offset - this.#initHeight;
                tooltipX = targetBounds.left + (targetBounds.width / 2) - (this.#initWidth / 2);
                this.#transformOrigin = "center bottom";
            break;

            case "top-right":
                tooltipY = targetBounds.top - this.#offset - this.#initHeight;
                tooltipX = targetBounds.right - this.#initWidth;
                this.#transformOrigin = "right bottom";
            break;

            // left
            case "left-top":
                tooltipX = targetBounds.left - this.#offset - this.#initWidth;
                tooltipY = targetBounds.top;
                this.#transformOrigin = "right top";
            break;

            case "left-center":
                tooltipX = targetBounds.left - this.#offset - this.#initWidth;
                tooltipY = targetBounds.top + (targetBounds.height / 2) - (this.#initHeight / 2);
                this.#transformOrigin = "right center";
            break;

            case "left-bottom":
                tooltipX = targetBounds.left - this.#offset - this.#initWidth;
                tooltipY = targetBounds.bottom - this.#initHeight;
                this.#transformOrigin = "right bottom";
            break;
        }

        this.style.left = String(tooltipX) + "px";
        this.style.top = String(tooltipY) + "px";

        if( this.#useTransitions === true )
        {
            /*
            const transformDirection = this.#position.split("-")[0];
            switch( transformDirection )
            {
                case "bottom" : this.#transform = "translate(0%, 20%)";  break;
                case "top" :    this.#transform = "translate(0%, -20%)"; break;
                case "left" :   this.#transform = "translate(-20%, 0%)"; break;
                case "right" :  this.#transform = "translate(20%, 0%)";  break;
                default:        this.#transform = "translate(0%, 0%)";   break;
            }
            */

            this.style.opacity = "0";
            this.style.transformOrigin = this.#transformOrigin;
        }
        else
        {
            this.style.transitionProperty = "none";
            this.style.transformOrigin = this.#transformOrigin;
            this.style.transform = "scale(1)";
            this.style.opacity = "1";
        }
    }

    show()
    {
        if( this.#isShown === true ) { return; }
        this.#layoutTooltip();
        this.style.visibility = "visible";
        this.#isShown = true;
        if( this.useTransitions === true )
        {
            this.style.transitionProperty = "opacity, transform";
            this.style.opacity = "1";
            this.style.transform = "scale(1)";
        }
    }

    hide()
    {
        if( this.#isShown === false ) { return; }
        this.#isShown = false;
        if( this.useTransitions === true )
        {
            this.style.opacity = "0";
            this.style.transform = "scale(0)";
        }
        else
        {
            this.style.visibility = "hidden";
        }
    }
}
window.customElements.define("axial-tooltip-base", AxialTooltipBase);
export { AxialTooltipBase }