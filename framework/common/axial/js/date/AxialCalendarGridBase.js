"use strict"

//import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialToggleButtonGroupBase } from "../button/AxialToggleButtonGroupBase.js";
import { AxialToggleCalendarDate } from "./AxialToggleCalendarDate.js";

class AxialCalendarGridBase extends AxialToggleButtonGroupBase
{
    /** @type { Date } */
    #initDate;

    /** @type { Number } */
    #firstDayOfTheWeek = 1;

    constructor( date = new Date() )
    {
        super();
        this.classList.add("axial_calendar_grid_base");
        this.forceSelection = true;
        this.#initDate = date;
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        const currentYear = this.#initDate.getFullYear();
        const currentMonth = this.#initDate.getMonth();

        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const lastDayNum = lastDay.getDate();

        let rowIndex = 1;

        for( let i = 1; i <= lastDayNum; i++ )
        {
            const date = new Date( currentYear, currentMonth, i);
            let dayNum = date.getDay();
            let columnIndex = dayNum - this.#firstDayOfTheWeek + 1;
            if( dayNum < this.#firstDayOfTheWeek )
            {
                columnIndex = columnIndex + 7;
            }

            const toggleDate = new AxialToggleCalendarDate();
            toggleDate.style.gridColumn = columnIndex;
            toggleDate.style.gridRow = rowIndex;

            toggleDate.date = date;

            //this.appendChild( toggleDate );
            this.addToggle( toggleDate );

            if( columnIndex == 7 ) { rowIndex += 1; }
        }
    }
}
window.customElements.define("axial-calendar-grid-base", AxialCalendarGridBase);
export { AxialCalendarGridBase }