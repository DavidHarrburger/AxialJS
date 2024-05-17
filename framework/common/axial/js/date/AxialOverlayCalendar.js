"use strict"

import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";

class AxialOverlayCalendar extends AxialOverlayBase
{
    constructor()
    {
        super();
        this.classList.add("axial_overlay_calendar");
        this.template = "axial-overlay-calendar-template";
    }
}
window.customElements.define("axial-overlay-calendar", AxialOverlayCalendar);
export { AxialOverlayCalendar }