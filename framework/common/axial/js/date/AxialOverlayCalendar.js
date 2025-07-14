"use strict";

import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";
import { AxialCalendar } from "./AxialCalendar.js";

class AxialOverlayCalendar extends AxialOverlayBase
{
    /// elements
    /** @type { AxialCalendar } */
    #calendar;

    constructor()
    {
        super();
        this.classList.add("axial_overlay_calendar");
        this.template = "axial-overlay-calendar-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#calendar = this.shadowRoot.getElementById("calendar");
    }
}
window.customElements.define("axial-overlay-calendar", AxialOverlayCalendar);
export { AxialOverlayCalendar }