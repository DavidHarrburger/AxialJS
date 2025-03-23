"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialAgendaHour extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_agenda_hour");
        this.template = "axial-agenda-hour-template";
    }
}

window.customElements.define("axial-agenda-hour", AxialAgendaHour);
export { AxialAgendaHour }