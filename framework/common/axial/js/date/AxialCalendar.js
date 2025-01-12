"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialCalendarGridBase } from "./AxialCalendarGridBase.js";

class AxialCalendar extends AxialComponentBase
{
    /// vars
    /** @type { Date } */
    #initDate = new Date();

    /** @type { Number } */
    #firstDayOfTheWeek = 1;

    /** @type { Array.<String> } */
    #daysNames = [ "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" ];

    /** @type { Array.<String> } */
    #monthsNames = [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ];

    /** @type { Date } */
    #date = undefined;
    
    /// ui
    /** @type { HTMLElement } */
    #label;

    /** @type { HTMLElement } */
    #previous;

    /** @type { HTMLElement } */
    #next;

    /** @type { HTMLElement } */
    #days;

    /** @type { AxialCalendarGridBase } */
    #grid;

    /// events
    /** @type { Function } */
    #boundDateChangedHandler;

    /** @type { Function } */
    #boundPreviousClickHandler;

    /** @type { Function } */
    #boundNextClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_calendar");
        this.template = "axial-calendar-template";
        this.#boundDateChangedHandler = this.#dateChangedHandler.bind(this);
        this.#boundPreviousClickHandler = this.#previousClickHandler.bind(this);
        this.#boundNextClickHandler = this.#nextClickHandler.bind(this);
    }

    get date() { return this.#date; }
    set date( value )
    {
        if( value instanceof Date === false )
        {
            throw new TypeError("Date value expected");
        }
        this.#date = value;
        this.#initDate = this.#date;
        const currentMonth = this.#initDate.getMonth();
        const currentYear = this.#initDate.getFullYear();

        if( this.#grid )
        {
            this.#grid.date = this.#date;
        }

        if( this.#label )
        {
            this.#label.innerHTML = this.#monthsNames[currentMonth] + " " + String(currentYear);
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#label = this.shadowRoot.getElementById("label");
        this.#days = this.shadowRoot.getElementById("days");
        this.#grid = this.shadowRoot.getElementById("dates");
        this.#previous = this.shadowRoot.getElementById("previous");
        this.#next = this.shadowRoot.getElementById("next");

        const currentYear = this.#initDate.getFullYear();
        const currentMonth = this.#initDate.getMonth();
        const currentMonthName = this.#monthsNames[currentMonth];

        if( this.#label )
        {
            this.#label.innerHTML = currentMonthName + " " + String(currentYear);
        }

        if( this.#days )
        {
            for( let i = 0; i < 7 ; i++ )
            {
                let columnIndex = i - this.#firstDayOfTheWeek + 1;
                if( i < this.#firstDayOfTheWeek )
                {
                    columnIndex = columnIndex + 7;
                }
                
                const dayItem = document.createElement("div");
                dayItem.classList.add("axial_calendar-day");
                dayItem.innerHTML = this.#daysNames[i].substring(0, 3);
                dayItem.style.gridColumn = columnIndex;
                dayItem.style.gridRow = 1;
                this.#days.appendChild( dayItem );
            }
        }

        if( this.#grid )
        {
            this.#grid.addEventListener( "dateChanged", this.#boundDateChangedHandler );
        }

        if( this.#previous ) { this.#previous.addEventListener("click", this.#boundPreviousClickHandler); }
        if( this.#next )     { this.#next.addEventListener("click", this.#boundNextClickHandler); }
    }

    /** @type { Function } */;
    #dateChangedHandler( event )
    {
        //console.log("AxialCalendar dateChanged");
        const newDate = event.detail.date;
        this.#date = newDate;
        const dateChangedEvent = new CustomEvent("dateChanged", { bubbles: false, detail: { date: newDate } } );
        this.dispatchEvent( dateChangedEvent );

    }

    #previousClickHandler( event )
    {
        const currentMonth = this.#initDate.getMonth();
        const currentYear = this.#initDate.getFullYear();
        
        const newMonth = (currentMonth - 1) == -1 ? 11 : (currentMonth - 1);
        const newYear = newMonth == 11 ? currentYear - 1 : currentYear;

        const newInitDate = new Date( newYear, newMonth );
        this.#initDate = newInitDate;

        if( this.#grid )
        {
            this.#grid.setNewDate( this.#initDate );
        }

        if( this.#label )
        {
            this.#label.innerHTML = this.#monthsNames[newMonth] + " " + String(newYear);
        }
    }

    #nextClickHandler( event )
    {
        const currentMonth = this.#initDate.getMonth();
        const currentYear = this.#initDate.getFullYear();
        
        const newMonth = (currentMonth + 1) == 12 ? 0 : (currentMonth + 1);
        const newYear = newMonth == 0 ? currentYear + 1 : currentYear;

        const newInitDate = new Date( newYear, newMonth );
        this.#initDate = newInitDate;

        if( this.#grid )
        {
            this.#grid.setNewDate( this.#initDate );
        }

        if( this.#label )
        {
            this.#label.innerHTML = this.#monthsNames[newMonth] + " " + String(newYear);
        }
    }

    
}
window.customElements.define("axial-calendar", AxialCalendar);
export { AxialCalendar }