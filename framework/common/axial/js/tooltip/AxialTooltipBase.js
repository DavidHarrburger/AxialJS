"use strict"

import { AxialTooltipManager } from "./AxialTooltipManager.js";

const AXIAL_TOOLTIP_POSITIONS = new Set(["top", "left", "right", "bottom"]);

class AxialTooltipBase
{
    // ui
    /**
     * The main element that contains the tooltip
     * @type { HTMLDivElement }
     */
    #element;

    #label;
    #arrow;

    // vars
    #target; // the HTML element targeted
    #position = "bottom"; // the prefered position for the tooltip relative to is target
    #useArrow = true; // the tooletip uses or not an arrow. Default true
    #offset = 1; // a decay between the tooltip and its target
    #tooltipText = ""; // the text to display inside the label element

    // styles
    #color = "#fff";
    #backgroundColor = "#fff";

    /**
     * Create a tooltip with the specified text
     * @param { String } tooltipText
     */
    constructor( tooltipText = "" )
    {
        if( tooltipText != "" )
        {
            this.#tooltipText = tooltipText;
        }
        // ui element
        this.#element = document.createElement("div");
        this.#element.classList.add("ax-tooltip");
        AxialTooltipManager.layer.appendChild(this.#element);

        this.#arrow = document.createElement("div");
        this.#arrow.classList.add("ax-tooltip-arrow");
        this.#element.appendChild(this.#arrow);

        this.#label = document.createElement("div");
        this.#label.classList.add("ax-tooltip-label");
        this.#label.innerHTML = this.#tooltipText;
        this.#element.appendChild(this.#label);
    }

    get target() { return this.#target; }
    set target( value )
    {
        // free the tooltip !
        if( value == null || value == undefined )
        {
            this.#target = value;
            return;
        }
        else if(  value instanceof HTMLElement == false ) // element == null || element == undefined ||
        {
            throw new TypeError( "HTMLElement value expected" );
        }
        if( value == this.#target ) { return; }
        this.#target = value;
    }

    get arrow()
    {
        if( this.#arrow ) { return this.#arrow; }
    }

    get element()
    {
        if( this.#element ) { return this.#element; }
    }

    get tooltipText() { return this.#tooltipText; }
    set tooltipText( value )
    {
        if( typeof value !== "string" )
        {
            throw new Error("String value expected");
        }
        if( value == this.#tooltipText ) { return };
        this.#tooltipText = value;
        if( this.#label )
        {
            this.#label.innerHTML = this.#tooltipText;
        }
    }

    get position() { return this.#position; }
    set position( value )
    {
        if( typeof value !== "string" )
        {
            throw new Error("String value expected : 'top', 'left', 'right' or 'bottom'");
        }
        if( AXIAL_TOOLTIP_POSITIONS.has(value) == false )
        {
            throw new Error("Bad string value : 'top', 'left', 'right' or 'bottom' expected");
        }
        if( value == this.#position ) { return };
        this.#position = value;
    }

    // the script assumes (for the moment), the arrow does not change at runtime (i.e. when the tooltip is displayed)
    get useArrow() { return this.#useArrow; }
    set useArrow( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new Error("Boolean value expected");
        }
        if( value == this._arrow ) { return; }
        this.#useArrow = value;
    }

    get offset() { return this.#offset; }
    set offset( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( value == this.#offset ) { return; }
        this.#offset = value;
    }

    show()
    {
        AxialTooltipManager.showTooltip(this);
    }

    hide()
    {
        AxialTooltipManager.hideTooltip(this);
    }

    // utils @override
    _removeArrowPositionClass()
    {
        let arrowClasses = this.#arrow.classList;
        
        for( let css of arrowClasses )
        {
            if( css.indexOf("ax-tooltip-arrow-") == 0 )
            {
                this.#arrow.classList.remove(css);
            }
        }
        

        // IMPORTANT for of loop causes a bug in IE 11
        /*
        let l = arrowClasses.length;
        for( let i = 0; i < l; i++ )
        {
            let css = arrowClasses[i];
            if( css.indexOf("ax-tooltip-arrow-") == 0 )
            {
                this._arrowHolder.classList.remove(css);
            }
        }
        */
    }
}

export { AxialTooltipBase }