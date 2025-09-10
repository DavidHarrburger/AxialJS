"use strict";

import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";
import { AxialCalendar } from "./AxialCalendar.js";

class AxialOverlayCalendar extends AxialOverlayBase
{
    /// elements
    /** @type { AxialCalendar } */
    #calendar;

    /// events
    /** @type { Function } */
    #boundDateChangedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_overlay_calendar");
        this.template = "axial-overlay-calendar-template";
        this.#boundDateChangedHandler = this.#dateChangedHandler.bind(this);
    }

    /**
     * @type { AxialCalendar }
     * @readonly
     */
    get calendar() { return this.#calendar; }

    _buildComponent()
    {
        super._buildComponent();
        this.#calendar = this.shadowRoot.getElementById("calendar");
        this.#calendar.addEventListener("dateChanged", this.#boundDateChangedHandler);
    }

    /** @type { Function } */;
    #dateChangedHandler( event )
    {
        //console.log("overlay calendar date changed");
        const newDate = event.detail.date;
        const dateChangedEvent = new CustomEvent("dateChanged", { bubbles: false, detail: { date: newDate } } );
        this.dispatchEvent( dateChangedEvent );
        this.hide();

    }
}
window.customElements.define("axial-overlay-calendar", AxialOverlayCalendar);
export { AxialOverlayCalendar }