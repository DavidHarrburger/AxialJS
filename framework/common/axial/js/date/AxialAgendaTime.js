"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { DateUtils } from "../utils/DateUtils.js";

class AxialAgendaTime extends AxialComponentBase
{
    /// vars
    /** @type { Number } */
    #time;

    /// elements
    /** @type { HTMLElement } */
    #label;

    constructor()
    {
        super();
        this.classList.add("axial_agenda_time");
        this.template = "axial-agenda-time-template";
    }

    get time() { return this.#time; }
    set time( value )
    {
        if( isNaN(value) === true )
        {
            throw new TypeError("Number value between 0 and 24 included required");
        }
        if( value < 0 || value > 24 )
        {
            throw new TypeError("Number value between 0 and 24 included required");
        }

        this.#time = Math.floor( value );
        if( this.#label )
        {
            this.#label.innerHTML = DateUtils.formatHour( this.#time );
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#label = this.shadowRoot.getElementById("label");
        if( this.#time )
        {
            this.#label.innerHTML = DateUtils.formatHour( this.#time );
        }
    }
}

window.customElements.define("axial-agenda-time", AxialAgendaTime);
export { AxialAgendaTime }