"use strict";

import { AxialButton } from "../button/AxialButton.js";
import { DateUtils } from "../utils/DateUtils.js";
import { AxialCalendar } from "./AxialCalendar.js";
import { AxialOverlayCalendar } from "./AxialOverlayCalendar.js";

class AxialCalendarButton extends AxialButton
{
    /// vars
    /** @type { Date } */
    #date;

    /// elements
    /** @type { AxialOverlayCalendar } */
    #calendarOverlay;

    /// events
    /** @type { Function } */
    #boundDateChangedHandler;

    constructor()
    {
        super();
        this.#boundDateChangedHandler = this.#dateChangedHandler.bind(this);
    }

    /**
     * @type { AxialOverlayCalendar }
     * @readonly
     */
    get overlay() { return this.#calendarOverlay; }

    /**
     * @type { AxialCalendar }
     * @readonly
     */
    get calendar() { return this.#calendarOverlay.calendar; }

    /**
     * @type { Date }
     */
    get date() { return this.#date; }
    set date( value )
    {
        if( value instanceof Date === false )
        {
            throw new TypeError("Date value expected");
        }
        this.#date = value;
        this.text = DateUtils.format(value);
        if( this.calendar )
        {
            this.calendar.date = value;
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#calendarOverlay = new AxialOverlayCalendar();
        this.#calendarOverlay.target = this;
        this.#calendarOverlay.addEventListener("dateChanged", this.#boundDateChangedHandler);
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #dateChangedHandler( event )
    {
        //console.log("calendar button date changed");
        const newDate = event.detail.date;
        this.text = DateUtils.format(newDate);
        this.#date = newDate;
        const dateChangedEvent = new CustomEvent("dateChanged", { bubbles: false, detail: { date: newDate } } );
        this.dispatchEvent( dateChangedEvent );
    }

}

window.customElements.define("axial-calendar-button", AxialCalendarButton);
export { AxialCalendarButton }
