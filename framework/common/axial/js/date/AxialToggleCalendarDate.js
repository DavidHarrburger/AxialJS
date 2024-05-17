"use strict"

import { AxialToggleButtonBase } from "../button/AxialToggleButtonBase.js";

class AxialToggleCalendarDate extends AxialToggleButtonBase
{
    /// vars
    /** @type { Date } */
    #date;

    /// ui
    /** @type { HTMLElement } */
    #background;

    /** @type { HTMLElement } */
    #middleground;

    /** @type { HTMLElement } */
    #foreground;

    /** @type { HTMLElement } */
    #num;

    /// events
    /** @type { Function } */
    #boundEnterHandler;

    /** @type { Function } */
    #boundLeaveHandler;

    constructor()
    {
        super();
        this.classList.add("axial_toggle_calendar_date");
        this.template = "axial-toggle-calendar-date-template";

        this.#boundEnterHandler = this.#enterHandler.bind(this);
        this.#boundLeaveHandler = this.#leaveHandler.bind(this);

        this.addEventListener("pointerenter", this.#boundEnterHandler);
        this.addEventListener("pointerleave", this.#boundLeaveHandler);
    }

    connectedCallback()
    {
        super.connectedCallback();

        this.#background = this.shadowRoot.getElementById("background");
        this.#middleground = this.shadowRoot.getElementById("middleground");
        this.#foreground = this.shadowRoot.getElementById("foreground");
        this.#num = this.shadowRoot.getElementById("num");
        
        if( this.#date && this.#num )
        {
            this.#num.innerHTML = String( this.#date.getDate() );
        }
        
        
    }

    get date() { return this.#date; }
    set date( value )
    {
        console.log( value instanceof Date );
        if( value instanceof Date === false )
        {
            throw new TypeError("Date value expected");
        }
        this.#date = value;
        if( this.#num )
        {
            this.#num.innerHTML = String( this.#date.getDate() );
        }
    }

    ///
    /// EVENTS
    ///

    /**
     * 
     * @param { PointerEvent } event 
     */
    #enterHandler( event )
    {
        if( this.selected === false )
        {
            if( this.#background )
            {
                this.#background.style.opacity = "1";
            }
        }
    }

    /**
     * 
     * @param { PointerEvent } event 
     */
    #leaveHandler( event )
    {
        if( this.selected === false )
        {
            if( this.#background )
            {
                this.#background.style.opacity = "0";
            }
        }
    }

    _onToggleChanged()
    {
        if( this.selected === false )
        {
            if( this.#background )   { this.#background.style.opacity = "0"; }
            if( this.#middleground ) { this.#middleground.style.opacity = "0"; }
            if( this.#num )          { this.#num.style.color = "#232323"; this.#num.style.fontWeight = 500; }
            
        }
        else
        {
            if( this.#background )   { this.#background.style.opacity = "0"; }
            if( this.#middleground ) { this.#middleground.style.opacity = "1"; }
            if( this.#num )          { this.#num.style.color = "#fff"; this.#num.style.fontWeight = 800; }
        }
    }
    
}
window.customElements.define("axial-toggle-calendar-date", AxialToggleCalendarDate);
export { AxialToggleCalendarDate }