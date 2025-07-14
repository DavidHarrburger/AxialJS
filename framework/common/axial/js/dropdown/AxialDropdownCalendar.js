"use strict";

import { AxialDropdown } from "./AxialDropdown.js";
import { AxialCalendar } from "../date/AxialCalendar.js";
import { DateUtils } from "../utils/DateUtils.js";

class AxialDropdownCalendar extends AxialDropdown
{
    /// vars
    /** @type { Date } */
    #date = undefined;

    /// elements
    /** @type { AxialCalendar} */
    #calendar;

    /// events
    /** @type { Function } */
    #boundDateChangedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_dropdown_calendar");
        this.template = "axial-dropdown-calendar-template";
        this.#boundDateChangedHandler = this.#dateChangedHandler.bind(this);
    }

    get date() { return this.#date; }
    set date( value )
    {
        if( value instanceof Date === false )
        {
            throw new TypeError("Date value expected");
        }
        this.#date = value;
        this.text = DateUtils.format( this.#date );
        
        if( this.#calendar )
        {
            this.#calendar.date = value;
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#calendar = this.shadowRoot.getElementById("calendar");
        if( this.#calendar )
        {
            this.#calendar.addEventListener( "dateChanged", this.#boundDateChangedHandler );
        }
        
    }


    /** @type { CustomEvent } */
    #dateChangedHandler( event )
    {
        const newDate = event.detail.date;
        this.#date = newDate;
        this.text = DateUtils.format( newDate );

        const dateChangedEvent = new CustomEvent("dateChanged", { bubbles: false, detail: { date: newDate } } );
        this.dispatchEvent( dateChangedEvent );
        
        this.close();
    }
    
}

window.customElements.define("axial-dropdown-calendar", AxialDropdownCalendar);
export { AxialDropdownCalendar }