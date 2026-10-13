"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";
import { AxialAgendaDay } from "./AxialAgendaDay.js";
import { AxialAgendaHour } from "./AxialAgendaHour.js";
import { AxialAgendaTime } from "./AxialAgendaTime.js";
import { AxialAgendaCell } from "./AxialAgendaCell.js";
import { DateUtils } from "../utils/DateUtils.js";
import { StringUtils } from "../utils/StringUtils.js";

class AxialAgenda extends AxialServiceComponentBase
{
    static #MODES = Object.freeze( new Set( ["day", "week"] ) );
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
    #hourEnd = 22;

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

    /** @type { AxialAgendaCell } */
    #activeCell;

    /** @type { Object } */
    #activeCellData;

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
    #overlayGrid;

    /** @type { HTMLElement } */
    #content;

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

    // params
    /** @type { Boolean } */
    #allowPast = false;

    /** @type { Boolean } */
    #excludeToday = true;

    /** @type { Array<Boolean> } */
    #openedDays = [ false, true, true, true, true, true, false ];

    // cell events
    /** @type { Function } */
    #boundCellChangedHandler;

    constructor()
    {
        super();

        this.classList.add("axial_agenda");
        this.template = "axial-agenda-template";
        
        this.#boundPreviousClickHandler = this.#previousClickHandler.bind(this);
        this.#boundNextClickHandler = this.#nextClickHandler.bind(this);

        this.#boundCellChangedHandler = this.#cellChangedHandler.bind(this);
    }

    /**
     * @readonly
     * @type { Array<AxialAgendaCell> }
     */
    get cells() { return this.#agendaCells; }

    /**
     * @readonly
     * @type { Set<String> }
     */
    static get MODES() { return AxialAgenda.#MODES; }

    get mode() { return this.#mode; }
    set mode( value )
    {
        if( StringUtils.isWhite(value) === true )
        {
            throw new TypeError("String value required");
        }

        if( AxialAgenda.MODES.has(value) === false )
        {
            throw new Error("Wrong string value: day or week required");
        }
        if( this.#mode === value ) { return; }
        this.#mode = value;
        this.#clearAgenda();
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

        this.#content = this.shadowRoot.getElementById("content");

        this.#previous.addEventListener("click", this.#boundPreviousClickHandler);
        this.#next.addEventListener("click", this.#boundNextClickHandler);

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
        //console.log( "layout agenda", this.#mode);
        // update grid
        this.#grid.style.gridTemplateRows = `repeat(${this.#numHours}, 60px)`;
        this.#hours.style.gridRow = `1 / span ${this.#numHours}`;
        this.#times.style.gridRow = `1 / span ${this.#numHours}`;

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
                const dayDate = new Date( this.#firstDateOfTheWeek.getFullYear(), this.#firstDateOfTheWeek.getMonth(), (this.#firstDateOfTheWeek.getDate() + i) ) ;
                agendaDay.date = dayDate;

                // allow past
                let past = false;
                if( this.#allowPast === false )
                {
                    if( DateUtils.isPast( dayDate ) === true )
                    {
                        past = true;
                    }
                }
                // day off / open
                const isOpened = this.#openedDays[ dayDate.getDay() % 7 ];
                
                // final enabled
                const finalEnabled = !(isOpened == false || (isOpened == true && past == true));
                agendaDay.enabled = finalEnabled;

                if( this.#allowPast === false )
                {
                    const midnight = DateUtils.midnight( new Date() ).getTime();
                    const firstMidnight = DateUtils.midnight( this.#firstDateOfTheWeek ).getTime();
                    if( firstMidnight <= midnight )
                    {
                        this.#previous.style.display = "none";
                    }
                    else
                    {
                        this.#previous.style.display = "flex";
                    }
                }
                
                // dom
                this.#agendaDays.push(agendaDay);
                this.#days.appendChild(agendaDay);

                let cellStart = this.#hourStart - 1;
                for( let j = 1; j <= this.#numHours; j++ )
                {
                    cellStart += 1;
                    let cellEnd = cellStart + 1;
                    const cellRow = j;
                    const agendaCell = new AxialAgendaCell();
                    
                    agendaCell.date = dayDate;
                    agendaCell.start = cellStart;
                    agendaCell.end = cellEnd;
                    agendaCell.enabled = finalEnabled;

                    agendaCell.style.gridColumn = dayColumn;
                    agendaCell.style.gridRow = cellRow;

                    agendaCell.addEventListener("cellChanged", this.#boundCellChangedHandler);

                    this.#agendaCells.push(agendaCell);
                    this.#grid.appendChild(agendaCell);
                }

            }
        }
        else if( this.#mode === "day" )
        {
            //console.log( this.#currentDate );
            this.#days.style.gridTemplateColumns = "40px 1fr";
            this.#grid.style.gridTemplateColumns = "40px 1fr";

            // days
            const agendaDay = new AxialAgendaDay();
            agendaDay.style.gridColumn = 2;
            agendaDay.date = this.#currentDate;
            this.#days.appendChild(agendaDay);
            this.#agendaDays.push(agendaDay);

            const isOpened = this.#openedDays[ this.#currentDate.getDay() % 7 ];

            // grid / cells
            let cellStart = this.#hourStart - 1;
            for( let i = 1; i <= this.#numHours; i++ )
            {
                cellStart += 1;
                let cellEnd = cellStart + 1;
                const cellRow = i;
                const agendaCell = new AxialAgendaCell();

                agendaCell.date = this.#currentDate;
                agendaCell.start = cellStart;
                agendaCell.end = cellEnd;
                agendaCell.enabled = isOpened;

                agendaCell.style.gridColumn = 2;
                agendaCell.style.gridRow = cellRow;

                agendaCell.addEventListener("cellChanged", this.#boundCellChangedHandler);

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
        this.#adjustScroll();
        
    }

    #adjustScroll()
    {
        this.#days.style.overflowY = this.#grid.offsetHeight > this.#content.offsetHeight ? "hidden" : "hidden"; // weird 23.09.2026 -> back to fully hidden but I keep the line safe to remember there is probably a good reason I did that
    }


    /**
     * Set the start hour and the final one. 
     * @param { Number } open - Positive Integer from 0 to 23
     * @param { Number } close - positive Integer from 1 to 24
     */
    setDayTime( open, close )
    {
        // exclusions
        // open
        if( Number.isInteger(open) === false ) { throw new TypeError("Positive integer from 0 to 23"); }
        if( open < 0 || open > 23 ) { throw new TypeError("Positive integer from 0 to 23"); }

        // close
        if( Number.isInteger(close) === false ) { throw new TypeError("Positive integer from 1 to 24"); }
        if( close < 1 || close > 24 ) { throw new TypeError("Positive integer from 1 to 24"); }

        if( close <= open ) { throw new TypeError("Mate, are you serious ???"); }

        this.#hourStart = open;
        this.#hourEnd = close;
        this.#numHours = this.#hourEnd - this.#hourStart;

        if( this.componentBuilt === true )
        {
            this.#clearAgenda();
        }
    }

    #clearAgenda()
    {
        for( const cell of this.#agendaCells )
        {
            cell.removeEventListener("cellChanged", this.#boundCellChangedHandler);
            cell.remove();
        }
        for( const time of this.#agendaTimes ) { time.remove(); }
        for( const day of this.#agendaDays ) { day.remove(); }
        for( const hour of this.#agendaHours ) { hour.remove(); }
        
        this.#agendaDays = new Array();
        this.#agendaHours = new Array();
        this.#agendaTimes = new Array();
        this.#agendaCells = new Array();

        if( this.#activeCell )
        {
            this.#activeCell.selected = false;
            this.#activeCell = undefined;
        }

        if( this.#activeCellData )
        {
            this.#activeCellData = undefined;
        }
                
        this.#layoutAgenda();
    }

    #updateAgenda()
    {
        if( this.#activeCell )
        {
            this.#activeCell.selected = false;
            this.#activeCell = undefined;
        }
        
        if( this.#mode === "week" )
        {
            for( let i = 0; i < 7; i++ )
            {
                const agendaDay = this.#agendaDays[i];
                const updatedDate = new Date( this.#firstDateOfTheWeek.getFullYear(), this.#firstDateOfTheWeek.getMonth(), (this.#firstDateOfTheWeek.getDate() + i) );
                agendaDay.date = updatedDate;

                let past = false;
                if( this.#allowPast === false )
                {
                    if( DateUtils.isPast( updatedDate ) === true )
                    {
                        past = true;
                    }
                }
                // day off / open
                const isOpened = this.#openedDays[ updatedDate.getDay() % 7 ];
                
                const finalEnabled = !(isOpened == false || (isOpened == true && past == true));
                agendaDay.enabled = finalEnabled;

                const col = i+2;
                for( let j = 1; j <= this.#numHours; j++ )
                {
                    /** @type { AxialAgendaCell } */
                    const cell = this.#grid.querySelector( `[style*="grid-area: ${j} / ${col}"]` );
                    cell.enabled = finalEnabled;
                    cell.date = updatedDate;

                    // do faster check here
                    // check first day <
                    if( this.#activeCellData != undefined && this.areSameCellData( cell._getAsObject(), this.#activeCellData) == true )
                    {
                        cell.selected = true;
                        this.#activeCell = cell;
                    }
                }
            }

            if( this.#allowPast === false )
            {
                const midnight = DateUtils.midnight( new Date() ).getTime();
                const firstMidnight = DateUtils.midnight( this.#firstDateOfTheWeek ).getTime();
                if( firstMidnight <= midnight )
                {
                    this.#previous.style.display = "none";
                }
                else
                {
                    this.#previous.style.display = "flex";
                }
            }
        }
        else if( this.#mode === "day" )
        {
            const agendaDay = this.#agendaDays[0];
            agendaDay.date = this.#currentDate; //new Date( this.#currentDate.getFullYear(), this.#currentDate.getMonth(), this.#currentDate.getDate() );

            const isOpened = this.#openedDays[ this.#currentDate.getDay() % 7 ];
            agendaDay.enabled = isOpened;

            for( const cell of this.#agendaCells )
            {
                cell.enabled = isOpened;
                cell.date = this.#currentDate;
            }

            if( this.#allowPast === false )
            {
                const isSameDay = DateUtils.isSameDay(new Date(), this.#currentDate );
                if( isSameDay === true )
                {
                    this.#previous.style.display = "none";
                }
                else
                {
                    this.#previous.style.display = "flex";
                }
            }
        }

        const agendaEvent = new CustomEvent( "agendaUpdated", { bubbles: true, composed: true } );
        this.dispatchEvent( agendaEvent );
        
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

    /**
     * 
     * @param { CustomEvent } event 
     */
    #cellChangedHandler( event )
    {
        /** @type { AgendaCell } */
        const newActiveCell = event.target;
        const data = event.detail.cellData;

        if( this.#activeCell == undefined  && newActiveCell.selected == true )
        {
            this.#activeCell = newActiveCell;
            this.#activeCellData = data;
        }
        else if( this.#activeCell != undefined )
        {
            if( this.#activeCell == newActiveCell )
            {
                this.#activeCell = undefined;
                this.#activeCellData = undefined;
            }
            else
            {
                this.#activeCell.selected = false;
                this.#activeCell = newActiveCell;
                this.#activeCellData = data;
            }
        }
        //console.log(this.#activeCell);
    }

    /**
     * Assumes we comparing 2 AxialAgendaCell._getAsObject()
     * @param { Object } a 
     * @param { Object } b 
     * @returns { Boolean }
     */
    areSameCellData( a, b )
    {
        //console.log( a, b)
        //const startSame = a.start == b.start;
        //const endSame = a.end == b.end;
        //const daySame = new Date( a.date ).getDate() == new Date( b.date ).getDate();
        //console.log( startSame, endSame, daySame);
        
        return a.start == b.start && a.end == b.end && new Date( a.date ).getDate() == new Date( b.date ).getDate();
    }

    interactiveAll( b )
    {
        if( typeof b !== "boolean" )
        {
            throw new TypeError()
        }

        for( const cell of this.#agendaCells )
        {
            cell.isInteractive = b;
        }
    }

    unselect()
    {
        if( this.#activeCell )
        {
            this.#activeCell.selected = false;
            this.#activeCellData = undefined;
        }
    }
}
window.customElements.define("axial-agenda", AxialAgenda);
export { AxialAgenda }
