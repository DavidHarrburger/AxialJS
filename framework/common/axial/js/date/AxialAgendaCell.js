"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialAgendaCell extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_agenda_cell");
        this.template = "axial-agenda-cell-template";
    }
}

window.customElements.define("axial-agenda-cell", AxialAgendaCell);
export { AxialAgendaCell }