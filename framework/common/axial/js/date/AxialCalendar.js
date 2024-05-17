"use strict"

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

    /// ui
    /** @type { HTMLElement } */
    #label;

    /** @type { HTMLElement } */
    #previous;

    /** @type { HTMLElement } */
    #next;

    /** @type { HTMLElement } */
    #days;

    /** @type { HTMLElement } */
    #dates;

    constructor()
    {
        super();
        this.classList.add("axial_calendar");
        this.template = "axial-calendar-template";
        /*
        const currentYear = this.#initDate.getFullYear();
        console.log("currentYear = " + currentYear);

        const currentMonth = this.#initDate.getMonth();
        console.log("currentMonth = " + currentMonth);

        const firstDay = new Date( currentYear, currentMonth, 1);

        const lastDay = new Date( currentYear, currentMonth+2, 0);
        console.log(lastDay.getDate());

        console.log( this.#initDate.getDate() );
        */
    }

    connectedCallback()
    {
        super.connectedCallback();

        /// ui
        this.#label = this.shadowRoot.getElementById("label");
        this.#days = this.shadowRoot.getElementById("days");
        //this.#dates = this.shadowRoot.getElementById("dates");

        this.#buildComponent();

    }

    #buildComponent()
    {
        const currentYear = this.#initDate.getFullYear();
        const currentMonth = this.#initDate.getMonth();
        const currentMonthName = this.#monthsNames[currentMonth];

        const firstDay = new Date(currentYear, currentMonth, 1);
        const firstDayIndex = firstDay.getDay();

        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const lastDayNum = lastDay.getDate();

        console.log("firstDayIndex = " + firstDayIndex);

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

        /*
        if( this.#dates )
        {
            let rowIndex = 1;
            //let columnIndex = 1;

            for( let i = 1; i <= lastDayNum; i++ )
            {
                const date = new Date( currentYear, currentMonth, i);
                let dayNum = date.getDay();
                let columnIndex = dayNum - this.#firstDayOfTheWeek + 1;
                if( dayNum < this.#firstDayOfTheWeek )
                {
                    columnIndex = columnIndex + 7;
                }

                console.log(dayNum, columnIndex, rowIndex);
                const dateItem = document.createElement("div");
                dateItem.classList.add("axial_calendar-date");
                dateItem.innerHTML = String(i);
                dateItem.style.gridColumn = columnIndex;
                dateItem.style.gridRow = rowIndex;
                this.#dates.appendChild( dateItem );


                if( columnIndex == 7 ) { rowIndex += 1; }
            }
        }
        */
    }
}
window.customElements.define("axial-calendar", AxialCalendar);
export { AxialCalendar }