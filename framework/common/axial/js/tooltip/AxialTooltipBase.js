"use strict"

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
    #isBuilt = false;

    /** @type { Boolean } */
    #isShown = false;

    /** @type { HTMLElement } */
    #target = undefined;

    /** @type { String } */
    #position = "bottom-left";

    /** @type { Number } */
    #offset = 4;

    /** @type { String } */
    #transform = "translate(0%, 0%)";

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

        AxialTooltipManager.TOOLTIPS.add(this);

        const tooltipLayer = AxialTooltipManager.LAYER;
        //console.log("overlaysLayer = " + overlaysLayer);
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

    /*
    _finalizeComponent()
    {
        super._finalizeComponent();
        this.#buildComponent();
    }
    */

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
                this.#addTooltipHandlers();
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

    #addTooltipHandlers()
    {
        this.#target.addEventListener("pointerover", this.#boundTooltipTargetOverHandler);
        this.#target.addEventListener("pointerout", this.#boundTooltipTargetOutHandler);
    }

    #removeTooltipHandlers()
    {
        this.#target.removeEventListener("pointerover", this.#boundTooltipTargetOverHandler);
        this.#target.removeEventListener("pointerout", this.#boundTooltipTargetOutHandler);
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
            break;

            case "bottom-center":
                tooltipY = targetBounds.bottom + this.#offset;
                tooltipX = targetBounds.left + (targetBounds.width / 2) - (tooltipBounds.width / 2);
            break;

            case "bottom-right":
                tooltipY = targetBounds.bottom + this.#offset;
                tooltipX = targetBounds.right - tooltipBounds.width;
            break;

            // bottom
            case "right-top":
                tooltipX = targetBounds.right + this.#offset;
                tooltipY = targetBounds.top;
            break;

            case "right-center":
                tooltipX = targetBounds.right + this.#offset;
                tooltipY = targetBounds.top + (targetBounds.height / 2) - (tooltipBounds.height / 2);
            break;

            case "right-bottom":
                tooltipX = targetBounds.right + this.#offset;
                tooltipY = targetBounds.bottom - tooltipBounds.height;
            break;

            // top
            case "top-left":
                tooltipY = targetBounds.top - this.#offset - tooltipBounds.height;
                tooltipX = targetBounds.left;
            break;

            case "top-center":
                tooltipY = targetBounds.top - this.#offset - tooltipBounds.height;
                tooltipX = targetBounds.left + (targetBounds.width / 2) - (tooltipBounds.width / 2);
            break;

            case "top-right":
                tooltipY = targetBounds.top - this.#offset - tooltipBounds.height;
                tooltipX = targetBounds.right - tooltipBounds.width;
            break;

            // left
            case "left-top":
                tooltipX = targetBounds.left - this.#offset - tooltipBounds.width;
                tooltipY = targetBounds.top;
            break;

            case "left-center":
                tooltipX = targetBounds.left - this.#offset - tooltipBounds.width;
                tooltipY = targetBounds.top + (targetBounds.height / 2) - (tooltipBounds.height / 2);
            break;

            case "left-bottom":
                tooltipX = targetBounds.left - this.#offset - tooltipBounds.width;
                tooltipY = targetBounds.bottom - tooltipBounds.height;
            break;
        }

        this.style.left = String(tooltipX) + "px";
        this.style.top = String(tooltipY) + "px";

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
        this.#layoutTooltip();
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
}
window.customElements.define("axial-tooltip-base", AxialTooltipBase);
export { AxialTooltipBase }