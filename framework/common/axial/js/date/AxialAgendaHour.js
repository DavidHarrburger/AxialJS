"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialAgendaHour extends AxialComponentBase
{
    /// vars
    /** @type { Number } */
    #hour;

    constructor()
    {
        super();
        this.classList.add("axial_agenda_hour");
        this.template = "axial-agenda-hour-template";
    }

    get hour() { return this.#hour; }
    set hour( value )
    {
        if( isNaN(value) === true )
        {
            throw new TypeError("Number value between 0 and 24 included required");
        }
        if( value < 0 || value > 24 )
        {
            throw new TypeError("Number value between 0 and 24 included required");
        }

        this.#hour = Math.floor( value );
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-agenda-hour", AxialAgendaHour);
export { AxialAgendaHour }