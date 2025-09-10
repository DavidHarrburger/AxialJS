"use strict";

//import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialToggleButtonGroupBase } from "../button/AxialToggleButtonGroupBase.js";
import { DateUtils } from "../utils/DateUtils.js";
import { AxialToggleCalendarDate } from "./AxialToggleCalendarDate.js";

class AxialCalendarGridBase extends AxialToggleButtonGroupBase
{
    /// vars
    /** @type { Date } */
    #initDate;

    /** @type { Number } */
    #firstDayOfTheWeek = 1;

    /** @type { Date } */
    #date = undefined;

    /** @type { Boolean } */
    #allowPast = true;

    /** @type { Date } */
    #min;

    /** @type { Date } */
    #max;

    /// events
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

    get allowPast() { return this.#allowPast; }
    set allowPast( value )
    {
        if( typeof value !== "boolean")
        {
            throw new TypeError("Boolean value expected");
        }
        if( value === this.#allowPast ) { return; }
        this.#allowPast = value;
        for( const toggle of this.toggles )
        {
            const d = toggle.date;
            if( this.#allowPast === false && DateUtils.isPast(d) === true )
            {
                toggle.enabled = false;
            }
            else
            {
                toggle.enabled = true;
            }            
        }
    }

    get min() { return this.#min; }
    set min( value )
    {
        if( DateUtils.isValidDate(value) === false )
        {
            throw new TypeError("Date value expected"); 
        }
        if( value === this.#min ) { return; }
        this.#min = value;
        for( const toggle of this.toggles )
        {
            const d = toggle.date;
            if( DateUtils.isPastFrom( d, this.#min ) === true )
            {
                toggle.enabled = false;
            }
            else
            {
                toggle.enabled = true;
            }
        }
    }

    get max() { return this.#max; }
    set max( value )
    {
        if( DateUtils.isValidDate(value) === false )
        {
            throw new TypeError("Date value expected"); 
        }
        if( value === this.#max ) { return; }
        this.#max = value;
        for( const toggle of this.toggles )
        {
            const d = toggle.date;
            if( DateUtils.isFutureFrom( d, this.#max ) === true )
            {
                toggle.enabled = false;
            }
            else
            {
                toggle.enabled = true;
            }
        }
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

            if( this.#allowPast === false && DateUtils.isPast(date) === true )
            {
                toggleDate.enabled = false;
            }

            if( this.#min !== undefined && this.#max !== undefined )
            {
                //if( DateUtils.isInPeriod())
                if( DateUtils.isInPeriodFrom( date, this.#min, this.#max ) === false )
                {
                    toggleDate.enabled = false;
                }
                else
                {
                    toggleDate.enabled = true;
                }
            }
            else if( this.#min !== undefined && this.#max === undefined )
            {
                if( DateUtils.isPastFrom( date, this.#min ) === true )
                {
                    toggleDate.enabled = false;
                }
                else
                {
                    toggleDate.enabled = true;
                }
            }
            else if( this.#min === undefined && this.#max !== undefined )
            {
                if( DateUtils.isFutureFrom( date, this.#max ) === true )
                {
                    toggleDate.enabled = false;
                }
                else
                {
                    toggleDate.enabled = true;
                }
            }
            

            // ensure what happens if min < today when allowPast false;
            /*
            if( this.#min !== undefined )
            {
                if( DateUtils.isPastFrom( date, this.#min ) === true )
                {
                    toggleDate.enabled = false;
                }
                else
                {
                    toggleDate.enabled = true;
                }
            }

            if( this.#max !== undefined )
            {
                if( DateUtils.isFutureFrom( date, this.#max ) === true )
                {
                    toggleDate.enabled = false;
                }
                else
                {
                    toggleDate.enabled = true;
                }
            }
            */

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

    #updateMinMax()
    {

    }
}
window.customElements.define("axial-calendar-grid-base", AxialCalendarGridBase);
export { AxialCalendarGridBase }