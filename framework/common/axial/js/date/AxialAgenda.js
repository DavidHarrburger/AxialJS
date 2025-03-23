"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";
import { AxialAgendaDay } from "./AxialAgendaDay.js";
import { AxialAgendaHour } from "./AxialAgendaHour.js";
import { AxialAgendaCell } from "./AxialAgendaCell.js";

class AxialAgenda extends AxialServiceComponentBase
{
    /// vars
    /** @type { Number } */
    #numDays = 7;

    /** @type { Number } */
    #numHours = 24;

    /** @type { Array<AxialAgendaDay >} */
    #agendaDays;

    /** @type { Array<AxialAgendaHour >} */
    #agendaHours;

    /** @type { Array<AxialAgendaCell >} */
    #agendaCells;

    /// elements
    /** @type { HTMLElement } */
    #days;

    /** @type { HTMLElement } */
    #hours

    /** @type { HTMLElement } */
    #grid;

    /// events
    /** @type { Function } */
    #boundPreviousClickHandler;

    /** @type { Function } */
    #boundNextClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_agenda");
        this.template = "axial-agenda-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#days = this.shadowRoot.getElementById("days");
        this.#agendaDays = new Array();

        if( this.#days )
        {
            for( let i = 0; i <= this.#numDays; i++ )
            {
                const dayColumn = i + 1;
                const agendaDay = new AxialAgendaDay();
                agendaDay.style.gridColumn = dayColumn;
                if( i > 0 ) { this.#agendaDays.push(agendaDay); }
                this.#days.appendChild(agendaDay);
                
            }
        }

        this.#grid = this.shadowRoot.getElementById("grid");
        this.#agendaCells = new Array();

        if( this.#grid )
        {
            for( let i = 1; i <= this.#numDays; i++ )
            {
                const cellColumn = i + 1;
                for( let i = 1; i <= this.#numHours; i++ )
                {
                    const cellRow = i;
                    const agendaCell = new AxialAgendaCell();
                    agendaCell.style.gridColumn = cellColumn;
                    agendaCell.style.gridRow = cellRow;
                    this.#agendaCells.push(agendaCell);
                    this.#grid.appendChild(agendaCell);
                }
            }
        }
    }
}
window.customElements.define("axial-agenda", AxialAgenda);
export { AxialAgenda }
