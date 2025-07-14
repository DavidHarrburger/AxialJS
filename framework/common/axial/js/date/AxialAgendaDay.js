"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialAgendaDay extends AxialComponentBase
{
    /// vars
    /** @type { Number } */
    #firstDayOfTheWeek = 1;

    /** @type { Array.<String> } */
    #daysNames = [ "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" ];


    /** @type { Date } */
    #date = undefined;

    /** @type { Set } */
    #daysExclusions = new Set([ 0, 6 ]);

    /// elements
    /** @type { HTMLElement } */
    #dayName;

    /** @type { HTMLElement } */
    #dateNum;

    constructor()
    {
        super();
        this.classList.add("axial_agenda_day");
        this.template = "axial-agenda-day-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#dayName = this.shadowRoot.getElementById("dayName");
        this.#dateNum = this.shadowRoot.getElementById("dateNum");

        if( this.#date !== undefined )
        {
            this.#dayName.innerHTML = this.#daysNames[ this.#date.getDay() ];
            this.#dateNum.innerHTML = this.#date.getDate();
        }
    }

    get date() { return this.#date; }
    set date( value )
    {
        this.#date = value;

        if( this.#dayName )
        {
            this.#dayName.innerHTML = this.#daysNames[ this.#date.getDay() ];
        }

        if( this.#dateNum )
        {
            this.#dateNum.innerHTML = this.#date.getDate();
        }
    }
}

window.customElements.define("axial-agenda-day", AxialAgendaDay);
export { AxialAgendaDay }