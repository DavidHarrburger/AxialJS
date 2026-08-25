"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";
import { AxialToggleSwitch } from "../button/AxialToggleSwitch.js";
import { AxialButton } from "../button/AxialButton.js";

// import all lines types here
import { AxialSimulatorLine } from "./AxialSimulatorLine.js";

import { AxialSimulatorLineDim }     from "./lines/AxialSimulatorLineDim.js";
import { AxialSimulatorLineNum }     from "./lines/AxialSimulatorLineNum.js";
import { AxialSimulatorLineBoolean } from "./lines/AxialSimulatorLineBoolean.js";
import { AxialSimulatorLineRadio }   from "./lines/AxialSimulatorLineRadio.js";
import { AxialSimulatorLineCheck }   from "./lines/AxialSimulatorLineCheck.js";
import { AxialSimulatorLineSelect }  from "./lines/AxialSimulatorLineSelect.js";

/// RENAME TO BLOCK !IMPORTANT
class AxialSimulatorBlock extends AxialComponentBase
{
    /// static
    static #LINES_TYPES_ARRAY =
    [
        [ "num", AxialSimulatorLineNum ],
        [ "boolean", AxialSimulatorLineBoolean ],
        [ "radio", AxialSimulatorLineRadio ],
        [ "check", AxialSimulatorLineCheck ],
        [ "dim", AxialSimulatorLineDim ],
        [ "select", AxialSimulatorLineSelect ],
    ];

    static #LINES_TYPES_MAP = Object.freeze( new Map( AxialSimulatorBlock.#LINES_TYPES_ARRAY ) );
    /// vars
    /** @type { Object } */
    #stepObject;

    /** @type { Boolean } */
    #useSwitch = false;

    /** @type { Boolean } */
    #useAdd = false;

    /** @type { Boolean } */
    #enabled = true;

    /** @type { Object } */
    #savedData;

    /** @type { Array<AxialSimulatorLine> } */
    #lines = [];

    /** @type { Boolean } */
    #isCompleted = true;

    /// elements
    /** @type { HTMLElement } */
    #title;

    /** @type { AxialToggleSwitch } */
    #switch;

    /** @type { AxialButton } */
    #addButton;

    /** @type { HTMLElement } */
    #linesHolder;

    /// events
    /** @type { Function } */
    #boundSwitchHandler;

    /** @type { Function } */
    #boundAddHandler;

    /** @type { Function } */
    #boundLineChangedHandler;

    /** @type { Function } */
    #boundLineDeleteHandler;

    constructor()
    {
        super();
        this.classList.add("axial_simulator_block");
        this.template = "axial-simulator-block-template";
        this.#boundSwitchHandler = this.#switchHandler.bind(this);
        this.#boundAddHandler = this.#addHandler.bind(this);
        this.#boundLineChangedHandler = this.#lineChangedHandler.bind(this);
        this.#boundLineDeleteHandler = this.#lineDeleteHandler.bind(this);
    }

    /**
     * @type { Boolean }
     */
    get isCompleted() { return this.#isCompleted; }
    set isCompleted( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#isCompleted = value;
    }

    /**
     * @type { Array<AxialSimulatorLine> }
     * @readonly
     */
    get lines() { return this.#lines; }

    /**
     * @type { Boolean }
     * @readonly
     */
    get useAdd() { return this.#useAdd; }

    get enabled() { return this.#enabled; }
    set enabled( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#enabled === value ) { return; }
        this.#enabled = value;
        this.#setEnabled();
    }

    get step() { return this.#stepObject; }
    set step( value )
    {
        if( ObjectUtils.isObject(value) === false )
        {
            throw new TypeError("Plain Object value required");
        }

        this.#stepObject = value;
        if( this.componentBuilt === true )
        {
            this.#buildStep();
        }
    }

    get savedData() { return this.#savedData; }
    set savedData( value )
    {
        this.#savedData = value;
        if( this._onSavedData )
        {
            this._onSavedData();
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#title = this.shadowRoot.getElementById("title");
        this.#linesHolder = this.shadowRoot.getElementById("linesHolder");
        this.#switch = this.shadowRoot.getElementById("switch");
        this.#addButton = this.shadowRoot.getElementById("addButton");

        if( this.#switch)
        {
            this.#switch.addEventListener( "toggleChanged", this.#boundSwitchHandler );
        }
        if( this.#stepObject )
        {
            this.#buildStep();
        }
    }

    #buildStep()
    {
        if( this.#stepObject.title && this.#title )
        {
            this.#title.innerHTML = this.#stepObject.title;
        }

        if( this.#stepObject.useSwitch && this.#stepObject.useSwitch === true )
        {
            this.#useSwitch = true;
            if( this.#switch ) { this.#switch.style.display = "block"; }
            this.enabled = false;
        }

        if( this.#stepObject.useAdd && this.#stepObject.useAdd === true )
        {
            this.#useAdd = true;
            if( this.#addButton )
            {
                this.#addButton.style.display = "block";
                this.#addButton.addEventListener("click", this.#boundAddHandler);
                if( this.#stepObject.addLabel )
                {
                    this.#addButton.text = this.#stepObject.addLabel;
                }
            }
        }

        if( this.#linesHolder && this.#stepObject.lines && Array.isArray(this.#stepObject.lines) )
        {
            const lines = this.#stepObject.lines
            for( const line of lines )
            {
                const lineType = line?.type;
                //console.log( lineType );
                const lineRequired = line?.required;
                if( lineRequired === true ) { this.#isCompleted = false; }
                const LineClass = AxialSimulatorBlock.#LINES_TYPES_MAP.has( lineType ) === true ? AxialSimulatorBlock.#LINES_TYPES_MAP.get( lineType ) : AxialSimulatorLine;
                const lineElement = new LineClass();
                lineElement.addEventListener("stepLineChanged", this.#boundLineChangedHandler );
                lineElement.addEventListener("lineDelete", this.#boundLineDeleteHandler );
                lineElement.line = line;
                this.#linesHolder.appendChild(lineElement);
                this.#lines.push(lineElement);
            }
        }
    }

    #setEnabled()
    {
        console.log("set enable");
        const lines = Array.from( this.#linesHolder.children );
        const opacity = this.#enabled === true ? "1" : "0.5";
        this.style.opacity = opacity;
        for( const line of lines )
        {
            line._setEnabled( this.#enabled );
        }
    }

    #switchHandler( event )
    {
        this.enabled = this.#switch.selected;

        const simulatorStepEvent = new CustomEvent( "simulatorBlockCompleted", { detail: { completed: this.#isCompleted }} );
        this.dispatchEvent( simulatorStepEvent );
    }

    #addHandler( event )
    {
        console.log("ajouter une ligne");
        const lineType = this.#stepObject?.lineToAdd?.type;
        const LineClass = AxialSimulatorBlock.#LINES_TYPES_MAP.has( lineType ) === true ? AxialSimulatorBlock.#LINES_TYPES_MAP.get( lineType ) : AxialSimulatorLine;
        const lineElement = new LineClass();
        lineElement.addEventListener("stepLineChanged", this.#boundLineChangedHandler );
        lineElement.addEventListener("lineDelete", this.#boundLineDeleteHandler );
        lineElement.line = this.#stepObject?.lineToAdd;
        this.#linesHolder.appendChild(lineElement);
        this.#lines.push(lineElement);
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #lineChangedHandler( event )
    {
        console.log("linechanged in step");
        this.#controlStep();
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #lineDeleteHandler( event )
    {
        console.log("lineDelete");
        const line = event.target;
        const index = this.#lines.indexOf(line);
        this.#lines.splice(index, 1);
        line.remove();
        this.#controlStep();
    }

    #controlStep()
    {
        let tempCompleted = true;
        for( const l of this.#lines )
        {
            if( l.isCompleted === false )
            {
                tempCompleted = false;
                break;
            }
        }
        this.#isCompleted = tempCompleted;
        console.log("control step, isCompleted ", this.#isCompleted);
        
        const simulatorStepEvent = new CustomEvent( "simulatorBlockCompleted", { detail: { completed: this.#isCompleted }} );
        this.dispatchEvent( simulatorStepEvent );
    }

    _getAsObject()
    {
        let obj =
        {
            id: this.#stepObject.id,
            lines: [],
            switch: this.#enabled
        };
        
        for( const line of this.#lines )
        {
            obj.lines.push( line._getAsObject() );
        }

        return obj;
    }

    /**
     * @abstract
     */
    _onSavedData()
    {
        //const savedLines = this.savedData.lines;
        const savedLines = this.#savedData.lines;
        const sl = savedLines.length;
        const cl = this.#lines.length;

        // switch was missing
        if( this.#savedData.switch )
        {
            this.enabled = this.#savedData.switch;
            this.#switch.selected = this.#savedData.switch;
        }

        // cas où les lignes sont prédéfinies
        if( sl === cl )
        {
            for( let i = 0; i < sl; i++ )
            {
                const line = this.#lines[i];
                const lineData = savedLines[i];
                line.savedData = lineData;
            }
        }
        else
        {
            // cas des lignes ajoutées
            console.log("test lignes à ajouter");
            for( let j = 0; j < sl; j++ )
            {
                const savedLineData = savedLines[j];
                if( savedLineData.value == undefined || savedLineData.value == "" ) { continue; }
                const lineType = this.#stepObject?.lineToAdd?.type;
                const LineClass = AxialSimulatorBlock.#LINES_TYPES_MAP.has( lineType ) === true ? AxialSimulatorBlock.#LINES_TYPES_MAP.get( lineType ) : AxialSimulatorLine;
                const lineElement = new LineClass();
                lineElement.addEventListener("stepLineChanged", this.#boundLineChangedHandler );
                lineElement.addEventListener("lineDelete", this.#boundLineDeleteHandler );
                lineElement.line = this.#stepObject?.lineToAdd;
                this.#linesHolder.appendChild(lineElement);
                this.#lines.push(lineElement);
                lineElement.savedData = savedLines[j];
            }
        }
        
    }

}

window.customElements.define("axial-simulator-block", AxialSimulatorBlock);
export { AxialSimulatorBlock }