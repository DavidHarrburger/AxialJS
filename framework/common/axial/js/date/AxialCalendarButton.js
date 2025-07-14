"use strict";

import { AxialButton } from "../button/AxialButton.js";
import { AxialOverlayCalendar } from "./AxialOverlayCalendar.js";

class AxialCalendarButton extends AxialButton
{
    /// elements
    /** @type { AxialOverlayCalendar } */
    #calendarOverlay;

    constructor()
    {
        super();
    }

    _buildComponent()
    {
        super._buildComponent();

        console.log("AxialOverlayCalendar entry point");
        this.#calendarOverlay = new AxialOverlayCalendar();
        this.#calendarOverlay.target = this;
    }

}

window.customElements.define("axial-calendar-button", AxialCalendarButton);
export { AxialCalendarButton }
