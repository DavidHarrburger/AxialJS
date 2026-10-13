"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";
import { AxialToggleSwitch } from "../button/AxialToggleSwitch.js";
import { AxialButton } from "../button/AxialButton.js";

// import all lines types here
import { AxialSimulatorLine } from "./AxialSimulatorLine.js";
import { AxialSimulatorGroup } from "./AxialSimulatorGroup.js";

import { AxialSimulatorLineDim }     from "./lines/AxialSimulatorLineDim.js";
import { AxialSimulatorLineNum }     from "./lines/AxialSimulatorLineNum.js";
import { AxialSimulatorLineBoolean } from "./lines/AxialSimulatorLineBoolean.js";
import { AxialSimulatorLineRadio }   from "./lines/AxialSimulatorLineRadio.js";
import { AxialSimulatorLineCheck }   from "./lines/AxialSimulatorLineCheck.js";
import { AxialSimulatorLineSelect }  from "./lines/AxialSimulatorLineSelect.js";

import { AxialTooltip } from "../tooltip/AxialTooltip.js";
import { AxialTooltipManager } from "../tooltip/AxialTooltipManager.js";

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

        [ "Dimensions", AxialSimulatorLineDim ],
        [ "Boutons Radio", AxialSimulatorLineRadio ],
        [ "Nombre", AxialSimulatorLineNum ],
        [ "Menu Déroulant", AxialSimulatorLineSelect ],
        [ "Case à Cocher", AxialSimulatorLineCheck ],
        
        /// CHECK AUTO

        /*
        [ "num", AxialSimulatorLineNum ],
        [ "boolean", AxialSimulatorLineBoolean ],
        [ "radio", AxialSimulatorLineRadio ],
        [ "check", AxialSimulatorLineCheck ],
        
        [ "select", AxialSimulatorLineSelect ],
        */

        //Boutons Radio
        // Nombre
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

    /** @type { HTMLElement } */
    #info;

    /** @type { AxialToggleSwitch } */
    #switch;

    /** @type { AxialButton } */
    #addButton;

    /** @type { HTMLElement } */
    #linesHolder;

    /** @type { AxialTooltip } */
    #tooltip;

    /// events
    /** @type { Function } */
    #boundSwitchHandler;

    /** @type { Function } */
    #boundAddHandler;

    /** @type { Function } */
    #boundLineChangedHandler;

    /** @type { Function } */
    #boundLineDeleteHandler;

    /** @type { Function } */
    #boundLineDuplicateHandler;

    /** @type { Function } */
    #boundGroupChangedHandler

    constructor()
    {
        super();
        this.classList.add("axial_simulator_block");
        this.template = "axial-simulator-block-template";
        this.#boundSwitchHandler = this.#switchHandler.bind(this);
        this.#boundAddHandler = this.#addHandler.bind(this);
        this.#boundLineChangedHandler = this.#lineChangedHandler.bind(this);
        this.#boundLineDeleteHandler = this.#lineDeleteHandler.bind(this);
        this.#boundLineDuplicateHandler = this.#lineDuplicateHandler.bind(this);
        this.#boundGroupChangedHandler = this.#groupChangedHandler.bind(this);
    }

    static get LINES_TYPES_MAP() { return AxialSimulatorBlock.#LINES_TYPES_MAP; }

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
        this.#info = this.shadowRoot.getElementById("info");
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

        if( this.#stepObject.useSwitch != undefined && this.#stepObject.useSwitch === true )
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

        if( this.#info )
        {
            if( this.#stepObject.info != undefined )
            {
                this.#info.style.display = "flex";
                this.#tooltip = new AxialTooltip( this.#stepObject.info.description );
                AxialTooltipManager.addTooltip( this.#tooltip );
                this.#tooltip.target = this.#info;
            }
        }

        if( this.#linesHolder && this.#stepObject.lines && Array.isArray(this.#stepObject.lines) )
        {
            const lines = this.#stepObject.lines;
            for( const line of lines )
            {
                const isSubstep = line.key.indexOf("δ") === 0;
                if( isSubstep === true )
                {
                    const groupElement = new AxialSimulatorGroup();
                    groupElement.parentBlock = this;
                    groupElement.group = line;
                    groupElement.addEventListener("groupChanged", this.#boundGroupChangedHandler);
                    this.#linesHolder.appendChild(groupElement);
                    this.#lines.push(groupElement);
                }
                else
                {
                    const lineType = line?.type;
                    const lineRequired = line.required ?? line.mandatory;
                    //console.warn(lineRequired);
                    if( lineRequired === true ) { this.#isCompleted = false; }
                    const LineClass = AxialSimulatorBlock.#LINES_TYPES_MAP.has( lineType ) === true ? AxialSimulatorBlock.#LINES_TYPES_MAP.get( lineType ) : AxialSimulatorLine;
                    const lineElement = new LineClass();
                    lineElement.addEventListener("stepLineChanged", this.#boundLineChangedHandler );
                    lineElement.addEventListener("lineDelete", this.#boundLineDeleteHandler );
                    lineElement.addEventListener("lineDuplicate", this.#boundLineDuplicateHandler );
                    lineElement.line = line;
                    if( lineType == "Auto" )
                    {
                        lineElement.style.display = "none";
                    }
                    this.#linesHolder.appendChild(lineElement);
                    this.#lines.push(lineElement);
                }
            }
        }
    }

    #setEnabled()
    {
        console.log("set enable", this.#enabled, this);
        //console.log("set enable", this.#enabled, this);
        const lines = Array.from( this.#linesHolder.children );
        const opacity = this.#enabled === true ? "1" : "0.5";
        this.style.opacity = opacity;
        for( const line of lines )
        {
            if( line instanceof AxialSimulatorLine == true )
            {
                line._setEnabled( this.#enabled );
            }
            else
            {
                console.log( "Set enabled for group");
                
                // the group must be deactivated
                if( this.#enabled == false )
                {
                    console.log("FALSE");
                    line.enabled = false;
                }
                else
                {
                    console.log("TRUE");
                    const conditionKey = line.group.condition;
                    const conditionValue = line.group.value;
                    console.log( line.group );
                    console.log( conditionKey )
                    for( const recursiveLine of lines )
                    {
                        if( recursiveLine instanceof AxialSimulatorLine === true  && recursiveLine.line?.key === conditionKey )
                        {
                            console.log("CONDITION FOUND");
                            if( recursiveLine instanceof AxialSimulatorLineCheck === true )
                            {
                                const selected = recursiveLine._getAsObject().selected;
                                if( Array.isArray( selected ) && selected.length > 0 )
                                {
                                    line.enabled = true;
                                }
                                else
                                {
                                    line.enabled = false;
                                }
                            }
                            

                        }
                    }
                }
                // we search the condition line and its value
            }
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
        //console.log("ajouter une ligne");
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
        //console.log("linechanged in step");
        //console.log( event.currentTarget );
        //console.log("linechanged in step");
        //console.log( event.currentTarget );
        this.#checkGroup( event.currentTarget );
        this.#controlStep();
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #groupChangedHandler( event )
    {
        //console.log("group changed in block");
        //console.log("group changed in block");
        this.#controlStep();
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #lineDeleteHandler( event )
    {
        //console.log("lineDelete");
        //console.log("lineDelete");
        const line = event.target;
        const index = this.#lines.indexOf(line);
        this.#lines.splice(index, 1);
        line.remove();
        this.#controlStep();
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #lineDuplicateHandler( event )
    {
        //console.log("YEAH LINE DUPLICATE");
        //console.log("YEAH LINE DUPLICATE");
        /*
        const line = event.target;
        const index = this.#lines.indexOf(line);
        this.#lines.splice(index, 1);
        line.remove();
        this.#controlStep();
        */
        /** @type { AxialSimulatorLine } */
        const sourceLine = event.detail.line;
        const model = sourceLine.line;
        const lineType = model.type;

        const LineClass = AxialSimulatorBlock.#LINES_TYPES_MAP.has( lineType ) === true ? AxialSimulatorBlock.#LINES_TYPES_MAP.get( lineType ) : AxialSimulatorLine;
        const lineElement = new LineClass();
        lineElement.addEventListener("stepLineChanged", this.#boundLineChangedHandler );
        lineElement.addEventListener("lineDelete", this.#boundLineDeleteHandler );
        let newModel = model;
        newModel.useAdd = false;
        newModel.useTrash = true;

        lineElement.line = newModel;

        this.#linesHolder.appendChild(lineElement);
        this.#lines.push(lineElement);
    }

    /**
     * 
     * @param { AxialSimulatorLine } lineInit 
     */
    #checkGroup( lineInit )
    {
        const  canCheck = lineInit instanceof AxialSimulatorLineRadio == true || lineInit instanceof AxialSimulatorLineCheck == true;
        if( canCheck == false ) { return; }
        //console.warn("check group entry point");
        //console.warn("check group entry point");
        const initKey = lineInit.line.key;
        const index = lineInit._getAsObject()?.index;
        const selected = lineInit._getAsObject()?.selected;

        //console.log( "initKey", initKey)
        //console.log( "index", index);
        //console.log( "selected", selected);
        //console.log( "initKey", initKey)
        //console.log( "index", index);
        //console.log( "selected", selected);

        for( const line of this.#lines )
        {
            const isGroup = line instanceof AxialSimulatorGroup === true;
            if( isGroup === false ) { continue; }
            const cd = line.group.condition;
            const ix = line.group.value;

            // radio
            if( index != undefined )
            {
                if( initKey == cd )
                {
                    //console.log( "group ok", initKey)
                    //console.log( "group ok", initKey)
                    if( index == ix )
                    {
                        line.enabled = true;
                    }
                    else
                    {
                        line.enabled = false;
                    }
                }
            }
            // check -> voir si on a plusieurs checks
            else
            {
                if( initKey == cd )
                {
                    if( Array.isArray(selected) && selected.length > 0 )
                    {
                        line.enabled = true;
                    }
                    else
                    {
                        line.enabled = false;
                    }
                }
            }
        }
    }

    #controlStep()
    {
        let tempCompleted = true;
        for( const l of this.#lines )
        {
            if( l instanceof AxialSimulatorLine === true )
            {
                if( l.isCompleted === false )
                {
                    tempCompleted = false;
                    break;
                }
            }
            else if( l instanceof AxialSimulatorGroup === true )
            {
                if( l.enabled === true && l.isCompleted === false )
                {
                    tempCompleted = false;
                    break;
                }
            }
            else
            {
                console.warn("ERROR IN CONTROL BLOCK");
                console.warn("ERROR IN CONTROL BLOCK");
            }
            
        }
        this.#isCompleted = tempCompleted;
        //console.log("block isCompleted ", this.#isCompleted);
        //console.log("block isCompleted ", this.#isCompleted);
        
        const simulatorStepEvent = new CustomEvent( "simulatorBlockCompleted", { detail: { completed: this.#isCompleted }} );
        this.dispatchEvent( simulatorStepEvent );
    }

    _getAsObject()
    {
        let obj =
        {
            key: this.#stepObject.key,
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
        const savedLines = this.#savedData.lines;
        const sl = savedLines.length;

        // switch was missing
        if( this.#savedData.switch != undefined )
        {
            this.enabled = this.#savedData.switch;
            this.#switch.selected = this.#savedData.switch;
        }

        //console.log("linelength", sl);
        let linesWidthGroupToCheck = [];

        for( let d = 0; d < sl; d++ )
        {
            const lineData = savedLines[d];
            //console.log( lineData )
            //console.log( lineData )

            if( lineData.wasAdded == false || lineData.wasAdded == undefined )
            {
                // NORMAL CASE
                const normalLine = this.#lines[d];

                if( normalLine == undefined ) { continue; } // just in case
                normalLine.savedData = lineData;
                
                
                
                if( normalLine.line != undefined && normalLine.line.hasGroup == true )
                {
                    linesWidthGroupToCheck.push( normalLine );
                }
                

                if( normalLine instanceof AxialSimulatorLine  === true )
                {
                    normalLine._setEnabled(this.enabled);
                }
                /*
                else if( normalLine instanceof AxialSimulatorGroup === true )
                {
                    normalLine.enabled = this.enabled;
                }
                */
            }
            else
            {
                // get line Model
                // check position
                // add to holder
                // add the data

                const key = lineData.key;
                let modelToDuplicate;
                for( const presentLine of this.#lines )
                {
                    if( presentLine.line.key === key )
                    {
                        //console.error("Man you are safe")
                        modelToDuplicate = presentLine.line;
                        break;
                    }
                }
                if( modelToDuplicate )
                {
                    const mType = modelToDuplicate.type;
                    const LineClass = AxialSimulatorBlock.#LINES_TYPES_MAP.has( mType ) === true ? AxialSimulatorBlock.#LINES_TYPES_MAP.get( mType ) : AxialSimulatorLine;
                    
                    modelToDuplicate.useAdd = false;
                    modelToDuplicate.useTrash = true;

                    const lineElement = new LineClass();
                    lineElement.addEventListener("stepLineChanged", this.#boundLineChangedHandler );
                    lineElement.addEventListener("lineDelete", this.#boundLineDeleteHandler );
                    lineElement.line = modelToDuplicate;
                    this.#linesHolder.appendChild(lineElement);
                    this.#lines.push(lineElement);
                    lineElement.savedData = lineData;
                }
            
            }
            
        }
        
        if( this.#savedData.switch != undefined )
        {
            this.enabled = this.#savedData.switch;
            this.#switch.selected = this.#savedData.switch;
        }

        if( linesWidthGroupToCheck.length > 0 )
        {
            for( const lineToCheck of linesWidthGroupToCheck )
            {
                if( lineToCheck instanceof AxialSimulatorLineRadio == true )
                {
                    this.#checkGroup( lineToCheck );
                }
            }
        }
    }

}

window.customElements.define("axial-simulator-block", AxialSimulatorBlock);
export { AxialSimulatorBlock }