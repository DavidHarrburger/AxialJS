"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { DateUtils } from "../utils/DateUtils.js";

class AxialAgendaCell extends AxialComponentBase
{
    /// vars
    /** @type { Set<String> } */
    static #KINDS = new Set( [ "event", "ghost" ] );

    /** @type { Date } */
    #date;

    /** @type { String } */
    #outColor = "transparent";

    /** @type { String } */
    #overColor = "var(--colAccent)";

    /** @type { String } */
    #selectedColor = "var(--colPrimary)";

    /** @type { String } */
    #lockedColor = "#ccc";

    /** @type { String } */
    #disabledBackgroundColor = "#f8f9fb";

    /** @type { String } */
    #normalBackgroundColor = "#fff";

    /** @type { Number } */
    #start;

    /** @type { Number } */
    #end;

    /** @type { Boolean } */
    #enabled = true;

    /** @type { Boolean } */
    #selected = false;

    /** @type { Boolean } */
    #locked = false;

    /** @type { Boolean } */
    #isInteractive = true;

    /// elements
    /** @type { HTMLElement } */
    #background;

    /** @type { HTMLElement } */
    #over;

    /// events
    /** @type { Function } */
    #boundCellPointerEnterHandler;

    /** @type { Function } */
    #boundCellPointerLeaveHandler;

    /** @type { Function } */
    #boundCellClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_agenda_cell");
        this.template = "axial-agenda-cell-template";

        this.#boundCellPointerEnterHandler = this.#cellPointerEnterHandler.bind(this);
        this.#boundCellPointerLeaveHandler = this.#cellPointerLeaveHandler.bind(this);
        this.#boundCellClickHandler = this.#cellClickHandler.bind(this);
    }

    get selected() { return this.#selected; }
    set selected( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError( "Boolean value required" )
        }
        if( this.#selected == value ) { return; }
        this.#selected = value;
        console.log(this.#selected)
        if( this.#over )
        {
            if( this.#selected == true )
            {
                this.#over.style.borderColor = this.#selectedColor;
            }
            else
            {
                this.#over.style.borderColor = this.#outColor;
            }
        }
        
    }

    get isInteractive() { return this.#isInteractive; }
    set isInteractive( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError( "Boolean value required" )
        }
        //if( this.#isInteractive == value ) { return; }
        this.#isInteractive = value;
    }

    /**
     * Indicates the user that the cell is off
     */
    get enabled() { return this.#enabled; }
    set enabled( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError( "Boolean value required" )
        }
        if( this.#enabled === value ) { return; }
        
        this.#enabled = value;
        if( this.#enabled === false )
        {
            this.style.cursor = "forbidden";
            //this.style.opacity = "0.5";
        }
        else
        {
            this.style.cursor = "default";
            //this.style.opacity = "1";
        }
    }

    /**
     * The lock property indicates something happens at this date and at this time
     */
    get locked() { return this.#locked; }
    set locked( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        //if( this.#locked == value ) { return; }
        this.#locked = value;
        if( this.#background )
        {
            if( this.#locked === true )
            {
                this.#background.style.backgroundColor = this.#lockedColor;
            }
            else
            {
                this.#background.style.backgroundColor = "#ffffff";
            }
        }
    }

    get start() { return this.#start; }
    set start( value )
    {
        if( Number.isInteger(value) === false ) { throw new TypeError("Positive integer from 0 to 23"); }
        if( value < 0 || value > 23 ) { throw new TypeError("Positive integer from 0 to 23"); }

        if( this.#end != undefined && this.#end < value ) { throw new RangeError("value must be < than end property") }

        this.#start = value;
    }

    get end() { return this.#end; }
    set end( value )
    {
        if( Number.isInteger(value) === false ) { throw new TypeError("Positive integer from 0 to 23"); }
        if( value < 1 || value > 24 ) { throw new TypeError("Positive integer from 1 to 24"); }

        if( this.#start != undefined && this.#start > value ) { throw new RangeError("value must be > than end property") }

        this.#end = value;
    }

    /**
     * @type { Date }
     */
    get date() { return this.#date; }
    set date( value )
    {
        if( value instanceof Date === false )
        {
            throw new TypeError("Date value expected");
        }
        this.#date = value;
    }

    toLocale()
    {
        if( this.#date && this.#start && this.#end )
        {
            return DateUtils.toLocale( this.#date ) + ` de ${this.#start}h à ${this.#end}h`;
        }
        return "";
    }

    _getAsObject()
    {
        return { selected: this.#selected, date: this.#date, start: this.#start, end: this.#end };
    }

    disconnectedCallback()
    {
        super.disconnectedCallback();

        this.removeEventListener("pointerenter", this.#boundCellPointerEnterHandler);
        this.removeEventListener("pointerleave", this.#boundCellPointerLeaveHandler);
        this.removeEventListener("pointerclick", this.#boundCellClickHandler);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#background = this.shadowRoot.getElementById("background");
        this.#over = this.shadowRoot.getElementById("over");

        this.addEventListener("pointerenter", this.#boundCellPointerEnterHandler);
        this.addEventListener("pointerleave", this.#boundCellPointerLeaveHandler);
        this.addEventListener("click", this.#boundCellClickHandler);
    }

    #cellPointerEnterHandler( event )
    {
        if( this.#enabled === false ) { return; }
        if( this.#selected === true ) { return; }
        if( this.#isInteractive === false ) { return; }
        if( this.#over )
        {
            this.#over.style.borderColor = this.#overColor;
        }
    }

    #cellPointerLeaveHandler( event )
    {
        if( this.#enabled === false ) { return; }
        if( this.#selected === true ) { return; }
        if( this.#isInteractive === false ) { return; }
        if( this.#over )
        {
            this.#over.style.borderColor = this.#outColor;
        }
    }

    #cellClickHandler( event )
    {
        if( this.#enabled === false ) { return; }
        if( this.#isInteractive === false ) { return; }

        this.#selected = !this.#selected;
        if( this.#over )
        {
            if( this.#selected === true )
            {
                this.#over.style.borderColor = this.#selectedColor;
            }
            else
            {
                this.#over.style.borderColor = this.#overColor;
            }
            
        }
        const cellEvent = new CustomEvent( "cellChanged", { bubbles: true, composed: true, detail: { cell:this, cellData: this._getAsObject() } } );
        this.dispatchEvent(cellEvent);
    }
}

window.customElements.define("axial-agenda-cell", AxialAgendaCell);
export { AxialAgendaCell }