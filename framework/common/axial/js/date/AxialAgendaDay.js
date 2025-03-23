"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialAgendaDay extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_agenda_day");
        this.template = "axial-agenda-day-template";
    }
}

window.customElements.define("axial-agenda-day", AxialAgendaDay);
export { AxialAgendaDay }