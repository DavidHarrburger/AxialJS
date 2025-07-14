"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";
import { AxialAgendaDay } from "./AxialAgendaDay.js";
import { AxialAgendaHour } from "./AxialAgendaHour.js";
import { AxialAgendaTime } from "./AxialAgendaTime.js";
import { AxialAgendaCell } from "./AxialAgendaCell.js";
import { DateUtils } from "../utils/DateUtils.js";

class AxialAgenda extends AxialServiceComponentBase
{
    /// vars
    /** @type { String } */
    #mode = "week";

    /** @type { Date } */
    #initDate = new Date();

    /** @type { Number } */
    #firstDayOfTheWeek = 1;

    /** @type { Date } */
    #firstDateOfTheWeek;

    /** @type { Date } */
    #currentDate;

    /** @type { Array.<String> } */
    #daysNames = [ "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" ];

    /** @type { Array.<String> } */
    #monthsNames = [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ];
    ///
    /** @type { Number } */
    #numDays = 7;

    /** @type { Number } */
    #hourStart = 7;

    /** @type { Number } */
    #hourEnd = 20;

    /** @type { Number } */
    #numHours = this.#hourEnd - this.#hourStart;

    /** @type { Array<AxialAgendaDay >} */
    #agendaDays;

    /** @type { Array<AxialAgendaHour >} */
    #agendaHours;

    /** @type { Array<AxialAgendaTime >} */
    #agendaTimes;

    /** @type { Array<AxialAgendaCell >} */
    #agendaCells;

    /// elements
    /** @type { HTMLElement } */
    #days;

    /** @type { HTMLElement } */
    #hours;

    /** @type { HTMLElement } */
    #times;

    /** @type { HTMLElement } */
    #grid;

    /** @type { HTMLElement } */
    #label;

    /** @type { HTMLElement } */
    #previous;

    /** @type { HTMLElement } */
    #next;

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
        this.#boundPreviousClickHandler = this.#previousClickHandler.bind(this);
        this.#boundNextClickHandler = this.#nextClickHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        // vars
        this.#agendaDays = new Array();
        this.#agendaHours = new Array();
        this.#agendaTimes = new Array();
        this.#agendaCells = new Array();

        // elements
        this.#label = this.shadowRoot.getElementById("label");
        this.#previous = this.shadowRoot.getElementById("previous");
        this.#next = this.shadowRoot.getElementById("next");

        this.#days = this.shadowRoot.getElementById("days");
        this.#hours = this.shadowRoot.getElementById("hours");
        this.#times = this.shadowRoot.getElementById("times");
        this.#grid = this.shadowRoot.getElementById("grid");

        this.#previous.addEventListener("click", this.#boundPreviousClickHandler);
        this.#next.addEventListener("click", this.#boundNextClickHandler);
        
        // update grid
        this.#grid.style.gridTemplateRows = `repeat(${this.#numHours}, 60px)`;
        this.#hours.style.gridRow = `1 / span ${this.#numHours}`;
        this.#times.style.gridRow = `1 / span ${this.#numHours}`;

        const initDay = this.#initDate.getDay();
        let deltaDay = initDay - this.#firstDayOfTheWeek;
        if( deltaDay < 0 )
        {
            deltaDay = deltaDay + 7;
        }

        this.#firstDateOfTheWeek = new Date(this.#initDate.getFullYear(), this.#initDate.getMonth(), (this.#initDate.getDate() - deltaDay));

        this.#currentDate = this.#initDate; // ATM we goe with the actual date but could be another one i.e. the first date available etc.

        this.#layoutAgenda();
    }

    #layoutAgenda()
    {
        if( this.#mode === "week" )
        {
            this.#days.style.gridTemplateColumns = "40px repeat(7, 1fr)";
            this.#grid.style.gridTemplateColumns = "40px repeat(7, 1fr)";

            // days
            for( let i = 0; i < this.#numDays; i++ )
            {
                const dayColumn = i + 2;
                const agendaDay = new AxialAgendaDay();
                agendaDay.style.gridColumn = dayColumn;
                agendaDay.date = new Date( this.#firstDateOfTheWeek.getFullYear(), this.#firstDateOfTheWeek.getMonth(), (this.#firstDateOfTheWeek.getDate() + i) ) ;
                this.#days.appendChild(agendaDay);
    
                this.#agendaDays.push(agendaDay);
            }
            
            // grid / cells
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
        else if( this.#mode === "day" )
        {
            this.#days.style.gridTemplateColumns = "40px 1fr";
            this.#grid.style.gridTemplateColumns = "40px 1fr";

            // days
            const agendaDay = new AxialAgendaDay();
            agendaDay.style.gridColumn = 2;
            agendaDay.date = this.#currentDate;
            this.#days.appendChild(agendaDay);
            this.#agendaDays.push(agendaDay);

            // grid / cells
            for( let i = 1; i <= this.#numHours; i++ )
            {
                const cellRow = i;
                const agendaCell = new AxialAgendaCell();
                agendaCell.style.gridColumn = 2;
                agendaCell.style.gridRow = cellRow;
                this.#agendaCells.push(agendaCell);
                this.#grid.appendChild(agendaCell);
            }
        }
        
        // hours
        for( let i = 1; i <= this.#numHours; i++ )
        {
            const agendaHour = new AxialAgendaHour();
            this.#hours.appendChild(agendaHour);
            agendaHour.hour = (i + this.#hourStart - 1 );
            this.#agendaHours.push(agendaHour);
        }
        
        // times
        for( let i = 1; i < this.#numHours; i++ )
        {
            const agendaTime = new AxialAgendaTime();
            this.#times.appendChild(agendaTime);
            agendaTime.time = (i + this.#hourStart );
            this.#agendaTimes.push(agendaTime);
        }
        
        this.#updateLabel();
    }

    #clearAgenda()
    {
        //this.#layoutAgenda();
    }

    #updateAgenda()
    {
        if( this.#mode === "week" )
        {
            for( let i = 0; i < 7; i++ )
            {
                const agendaDay = this.#agendaDays[i];
                agendaDay.date = new Date( this.#firstDateOfTheWeek.getFullYear(), this.#firstDateOfTheWeek.getMonth(), (this.#firstDateOfTheWeek.getDate() + i) );
            }
        }
        else if( this.#mode === "day" )
        {
            const agendaDay = this.#agendaDays[0];
            agendaDay.date = this.#currentDate; //new Date( this.#currentDate.getFullYear(), this.#currentDate.getMonth(), this.#currentDate.getDate() );
        }
        
        this.#updateLabel();
    }

    #updateLabel()
    {
        if( this.#mode === "week" )
        {
            const fdow = this.#agendaDays[0];
            const ldow = this.#agendaDays[6];
    
            const fm = fdow.date.getMonth();
            const lm = ldow.date.getMonth();
    
            const fy = fdow.date.getFullYear();
            const ly = ldow.date.getFullYear();
    
            let labelText = "";
            if( fy !== ly )
            {
                labelText = `${this.#monthsNames[fm]} ${fy} - ${this.#monthsNames[lm]} ${ly}`;
            }
            else
            {
                labelText = fm === lm ? `${this.#monthsNames[fm]} ${fy}` : `${this.#monthsNames[fm]} - ${this.#monthsNames[lm]} ${fy}`;
            }
            if( this.#label )
            {
                this.#label.innerHTML = labelText;
            }
        }
        else if( this.#mode === "day" )
        {
            const monthIndex = this.#currentDate.getMonth();
            this.#label.innerHTML = `${this.#monthsNames[monthIndex]} ${this.#currentDate.getFullYear()}`;
        }
        
    }

    #previousClickHandler( event )
    {
        if( this.#mode === "week" )
        {
            this.#firstDateOfTheWeek = new Date(this.#firstDateOfTheWeek.getFullYear(), this.#firstDateOfTheWeek.getMonth(), (this.#firstDateOfTheWeek.getDate() - 7));
        }
        else if( this.#mode === "day" )
        {
            this.#currentDate = new Date( this.#currentDate.getFullYear(), this.#currentDate.getMonth(), this.#currentDate.getDate() -1 );
        }
        
        this.#updateAgenda();
    }

    #nextClickHandler( event )
    {
        if( this.#mode === "week" )
        {
            this.#firstDateOfTheWeek = new Date(this.#firstDateOfTheWeek.getFullYear(), this.#firstDateOfTheWeek.getMonth(), (this.#firstDateOfTheWeek.getDate() + 7));
        }
        else if( this.#mode === "day" )
        {
            this.#currentDate = new Date( this.#currentDate.getFullYear(), this.#currentDate.getMonth(), this.#currentDate.getDate() + 1 );
        }
        
        this.#updateAgenda();
    }
}
window.customElements.define("axial-agenda", AxialAgenda);
export { AxialAgenda }
