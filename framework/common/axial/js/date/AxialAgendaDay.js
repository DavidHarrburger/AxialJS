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

    /** @type { Boolean } */
    #enabled = true;

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

        if( this.#enabled == false )
        {
            this.style.opacity = "0.5";
        }
    }

    get enabled() { return this.#enabled; }
    set enabled( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#enabled == value ) { return; }
        this.#enabled = value;
        if( this.#enabled == true )
        {
            this.style.opacity = "1";
        }
        else
        {
            this.style.opacity = "0.5";
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