"use strict";

//import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialToggleButtonGroupBase } from "../button/AxialToggleButtonGroupBase.js";
import { AxialToggleCalendarDate } from "./AxialToggleCalendarDate.js";

class AxialCalendarGridBase extends AxialToggleButtonGroupBase
{
    /** @type { Date } */
    #initDate;

    /** @type { Number } */
    #firstDayOfTheWeek = 1;

    /** @type { Date } */
    #date = undefined;

    /** @type { Function } */
    #boundIndexChangedHandler;

    constructor( date = new Date() )
    {
        super();
        this.classList.add("axial_calendar_grid_base");
        this.forceSelection = true;
        this.#initDate = date;
        this.#boundIndexChangedHandler = this.#indexChangedHandler.bind(this);
        this.addEventListener("indexChanged", this.#boundIndexChangedHandler);
    }

    get date() { return this.#date; }
    set date( value )
    {
        if( value instanceof Date === false )
        {
            throw new TypeError("Date value expected");
        }
        this.#date = value;
        this.setNewDate( this.#date );
    }

    _buildComponent()
    {
        super._buildComponent();

        const currentYear = this.#initDate.getFullYear();
        const currentMonth = this.#initDate.getMonth();

        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const lastDayNum = lastDay.getDate();

        let rowIndex = 1;

        for( let i = 1; i <= lastDayNum; i++ )
        {
            const date = new Date( currentYear, currentMonth, i);
            //console.log(date);
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
            this.appendToggle( toggleDate );

            if( this.#date != undefined )
            {
                if( ( date.getFullYear() == this.#date.getFullYear() ) &&
                    ( date.getMonth() == this.#date.getMonth() ) &&
                    ( date.getDate() == this.#date.getDate() ) )
                {
                    //console.log("same date found");
                    toggleDate.selected = true;
                }
            }

            if( columnIndex == 7 ) { rowIndex += 1; }
        }
    }

    /**
     * Rebuild the grid without changing the date property i.e. the current selected date
     * @param { Date } date 
     */
    setNewDate( date )
    {
        this.clearToggles();
        this.#initDate = date;
        this._buildComponent();
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #indexChangedHandler( event )
    {
        const toggle = this.getSelectedToggle();
        this.#date = toggle.date;
        const dateChangedEvent = new CustomEvent("dateChanged", { bubbles: true, detail: { date: this.#date } } );
        this.dispatchEvent( dateChangedEvent );
    }
}
window.customElements.define("axial-calendar-grid-base", AxialCalendarGridBase);
export { AxialCalendarGridBase }