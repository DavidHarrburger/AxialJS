"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";
import { AxialToggleSwitch } from "../button/AxialToggleSwitch.js";
import { AxialButton } from "../button/AxialButton.js";

// import all lines types here
import { AxialSimulatorLine } from "./AxialSimulatorLine.js";
import { AxialSimulatorBlock } from "./AxialSimulatorBlock.js";

import { AxialSimulatorLineDim }     from "./lines/AxialSimulatorLineDim.js";
import { AxialSimulatorLineNum }     from "./lines/AxialSimulatorLineNum.js";
import { AxialSimulatorLineBoolean } from "./lines/AxialSimulatorLineBoolean.js";
import { AxialSimulatorLineRadio }   from "./lines/AxialSimulatorLineRadio.js";
import { AxialSimulatorLineCheck }   from "./lines/AxialSimulatorLineCheck.js";
import { AxialSimulatorLineSelect }  from "./lines/AxialSimulatorLineSelect.js";

class AxialSimulatorGroup extends AxialComponentBase
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

        [ "Dimensions", AxialSimulatorLineDim ],
        [ "Boutons Radio", AxialSimulatorLineRadio ],
        [ "Nombre", AxialSimulatorLineNum ],
        [ "Menu Déroulant", AxialSimulatorLineSelect ],
        [ "Case à Cocher", AxialSimulatorLineCheck ],
        
        /// CHECK AUTO
    ];

    static #LINES_TYPES_MAP = Object.freeze( new Map( AxialSimulatorGroup.#LINES_TYPES_ARRAY ) );

    /// vars
    /** @type { Object } */
    #groupObject;

    /** @type { AxialSimulatorBlock } */
    #parentBlock;

    /** @type { Boolean } */
    #useAdd = false;

    /** @type { Boolean } */
    #enabled = false;

    /** @type { Object } */
    #savedData;

    /** @type { Array<AxialSimulatorLine> } */
    #lines = [];

    /** @type { Boolean } */
    #isCompleted = false;

    /// elements
    /** @type { HTMLElement } */
    #title;

    /** @type { AxialButton } */
    #addButton;

    /** @type { HTMLElement } */
    #linesHolder;

    /// events
    /** @type { Function } */
    #boundAddHandler;

    /** @type { Function } */
    #boundLineChangedHandler;

    /** @type { Function } */
    #boundLineDeleteHandler;

    constructor()
    {
        super();
        this.classList.add("axial_simulator_group");
        this.template = "axial-simulator-group-template";
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

    get parentBlock() { return this.#parentBlock; }
    set parentBlock( value )
    {
        if( value instanceof AxialSimulatorBlock == false )
        {
            throw new TypeError("AxialSimulatorBlock value required");
        }
        this.#parentBlock = value;
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
        //if( this.#enabled === value ) { return; }
        this.#enabled = value;
        this.#setEnabled();
    }

    get group() { return this.#groupObject; }
    set group( value )
    {
        if( ObjectUtils.isObject(value) === false )
        {
            throw new TypeError("Plain Object value required");
        }

        this.#groupObject = value;
        if( this.componentBuilt === true )
        {
            this.#buildGroup();
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
        this.#addButton = this.shadowRoot.getElementById("addButton");

        if( this.#groupObject )
        {
            this.#buildGroup();
        }
    }

    #buildGroup()
    {

        if( this.#groupObject.name && this.#title )
        {
            this.#title.innerHTML = this.#groupObject.name;
        }

        if( this.#groupObject.useAdd && this.#groupObject.useAdd === true )
        {
            this.#useAdd = true;
            if( this.#addButton )
            {
                this.#addButton.style.display = "block";
                this.#addButton.addEventListener("click", this.#boundAddHandler);
                if( this.#groupObject.addLabel )
                {
                    this.#addButton.text = this.#groupObject.addLabel;
                }
            }
        }

        if( this.#linesHolder && this.#groupObject.lines && Array.isArray(this.#groupObject.lines) )
        {
            const lines = this.#groupObject.lines;
            for( const line of lines )
            {
                const lineType = line?.type;
                const lineRequired = line.required ?? line.mandatory;
                //console.warn(lineRequired);
                if( lineRequired === true ) { this.#isCompleted = false; }
                const LineClass = AxialSimulatorGroup.#LINES_TYPES_MAP.has( lineType ) === true ? AxialSimulatorGroup.#LINES_TYPES_MAP.get( lineType ) : AxialSimulatorLine;
                const lineElement = new LineClass();
                lineElement.addEventListener("stepLineChanged", this.#boundLineChangedHandler );
                lineElement.addEventListener("lineDelete", this.#boundLineDeleteHandler );
                lineElement.line = line;
                this.#linesHolder.appendChild(lineElement);
                this.#lines.push(lineElement);
            }
        }

        this.#setEnabled();
    }

    #setEnabled()
    {
        console.warn("set enable in group", this.#enabled);
        console.log( this );
        const lines = Array.from( this.#linesHolder.children );
        const opacity = this.#enabled === true ? "1" : "0.5";
        //console.log(opacity);
        this.style.opacity = opacity;
        for( const line of lines )
        {
            line._setEnabled( this.#enabled );
        }
    }

    #addHandler( event )
    {
        //console.log("ajouter une ligne");
        const lineType = this.#groupObject?.lineToAdd?.type;
        const LineClass = AxialSimulatorGroup.#LINES_TYPES_MAP.has( lineType ) === true ? AxialSimulatorGroup.#LINES_TYPES_MAP.get( lineType ) : AxialSimulatorLine;
        const lineElement = new LineClass();
        lineElement.addEventListener("stepLineChanged", this.#boundLineChangedHandler );
        lineElement.addEventListener("lineDelete", this.#boundLineDeleteHandler );
        lineElement.line = this.#groupObject?.lineToAdd;
        this.#linesHolder.appendChild(lineElement);
        this.#lines.push(lineElement);
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #lineChangedHandler( event )
    {
        //console.log("linechanged in step");
        this.#controlGroup();
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #lineDeleteHandler( event )
    {
        //console.log("lineDelete in group");
        const line = event.target;
        const index = this.#lines.indexOf(line);
        this.#lines.splice(index, 1);
        line.remove();
        this.#controlGroup();
    }

    #controlGroup()
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
        //console.log("group isCompleted ", this.#isCompleted);
        
        const simulatorGroupEvent = new CustomEvent( "groupChanged", { detail: { completed: this.#isCompleted }} );
        this.dispatchEvent( simulatorGroupEvent );
    }

    _getAsObject()
    {
        let obj =
        {
            id: this.#groupObject.id,
            key: this.#groupObject.key,
            enabled: this.#enabled,
            lines: [],
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
        if( savedLines == undefined )
        {
            //console.warn("Group check point");
            return;
        }
        const sl = savedLines.length;
        const cl = this.#lines.length;

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
            //console.log("test lignes à ajouter");
            for( let j = 0; j < sl; j++ )
            {
                const savedLineData = savedLines[j];
                if( savedLineData.value == undefined || savedLineData.value == "" ) { continue; }
                const lineType = this.#groupObject?.lineToAdd?.type;
                const LineClass = AxialSimulatorGroup.#LINES_TYPES_MAP.has( lineType ) === true ? AxialSimulatorGroup.#LINES_TYPES_MAP.get( lineType ) : AxialSimulatorLine;
                const lineElement = new LineClass();
                lineElement.addEventListener("stepLineChanged", this.#boundLineChangedHandler );
                lineElement.addEventListener("lineDelete", this.#boundLineDeleteHandler );
                lineElement.line = this.#groupObject?.lineToAdd;
                this.#linesHolder.appendChild(lineElement);
                this.#lines.push(lineElement);
                lineElement.savedData = savedLines[j];
            }
        }

        

        /*
        this.#enabled = this.#savedData.enabled ?? false;
        console.warn("DATA IN GROUP END",  this.#savedData.enabled );
        
        if( this.#parentBlock !== undefined )
        {
            if( this.#parentBlock.enabled == false )
            {
                this.#enabled = false;
            }
        }
        */
        this.#setEnabled();
        
    }
}

window.customElements.define("axial-simulator-group", AxialSimulatorGroup);
export { AxialSimulatorGroup }