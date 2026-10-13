"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";
import { AxialIconButton } from "../button/AxialIconButton.js";
import { AxialTooltip } from "../tooltip/AxialTooltip.js";
import { AxialTooltipManager } from "../tooltip/AxialTooltipManager.js";
import { AxialHelpOverlay } from "../help/AxialHelpOverlay.js";

class AxialSimulatorLine extends AxialComponentBase
{
    /// vars
    /** @type { Object } */
    #lineObject;

    /** @type { Boolean } */
    #isCompleted = true;

    /** @type { Boolean } */
    #isRequired = false;

    /** @type { Boolean } */
    #useAdd = false;

    /** @type { Boolean } */
    #useTrash = false;

    /// elements
    /** @type { HTMLElement } */
    #label;

    /** @type { HTMLElement } */
    #info;

    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLElement } */
    #actions;

    /** @type { AxialIconButton } */
    #plusButton;

    /** @type { AxialIconButton } */
    #trashButton;

    /** @type { AxialTooltip } */
    #tooltip;

    /// events
    /** @type { Function } */
    #boundLineChangedHandler;

    /** @type { Function } */
    #boundPlusHandler;

    /** @type { Function } */
    #boundTrashHandler;

    /** @type { Function } */
    #boundInfoClickHandler;

    /** @type { Object } */
    #savedData;

    constructor()
    {
        super();
        this.classList.add("axial_simulator_line");
        this.template = "axial-simulator-line-template";
        this.#boundInfoClickHandler = this.#infoClickHandler.bind(this);
        this.#boundLineChangedHandler = this.#lineChangedHandler.bind(this);

        this.#boundPlusHandler = this.#plusHandler.bind(this);
        this.#boundTrashHandler = this.#trashHandler.bind(this);
    }

    /**
     * @type { Boolean }
     * @readonly
     */
    get isRequired() { return this.#isRequired; }

    /**
     * @type { Boolean }
     * @readonly
     */
    get useAdd() { return this.#useAdd; }

    /**
     * @type { Boolean }
     * @readonly
     */
    get useTrash() { return this.#useTrash; }

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

    get line() { return this.#lineObject; }
    set line( value )
    {
        if( ObjectUtils.isObject(value) === false )
        {
            throw new TypeError("Plain Object value required");
        }

        this.#lineObject = value;
        
        if( this.componentBuilt === true )
        {
            this.#buildLine();
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

        this.#label = this.shadowRoot.getElementById("label");
        this.#info = this.shadowRoot.getElementById("info");
        this.#holder = this.shadowRoot.getElementById("holder");
        this.#actions = this.shadowRoot.getElementById("actions");

        this.#plusButton = this.shadowRoot.getElementById("plusButton");
        if( this.#plusButton )
        {
            this.#plusButton.addEventListener("click", this.#boundPlusHandler);
        }
        
        this.#trashButton = this.shadowRoot.getElementById("trashButton");
        if( this.#trashButton )
        {
            this.#trashButton.addEventListener("click", this.#boundTrashHandler);
        }

        if( this.#lineObject )
        {
            this.#buildLine();
        }
    }

    /**
     * Main logic of the line. Build the component once the line property is setted
     */
    #buildLine()
    {
        this.#isRequired = this.#lineObject.required ?? this.#lineObject.mandatory;
        if( this.#isRequired )
        {
            this.#isCompleted = false;
        }
        if( this.#lineObject.label && this.#label )
        {
            if( this.#isRequired === true )
            {
                this.#label.innerHTML = this.#lineObject.label + "<span style='color:#c00; font-weight:600;'> *</span>";
            }
            else
            {
                this.#label.innerHTML = this.#lineObject.label;
            }
            
        }

        if( this.#lineObject.useAdd == true )
        {
            console.error( this.#lineObject )
        }

        
        if( this.#lineObject.useAdd && this.#lineObject.useAdd == true )
        {
            this.#useAdd = true;
            if( this.#actions ) { this.#actions.style.display = "flex"; }
            if( this.#plusButton ) { this.#plusButton.style.display = "block"; }
        }
        if( this.#lineObject.useTrash && this.#lineObject.useTrash == true )
        {
            this.#useAdd = false;
            this.#useTrash = true;
            if( this.#actions ) { this.#actions.style.display = "flex"; }
            if( this.#trashButton ) { this.#trashButton.style.display = "block"; }
        }

        
        if( this.#lineObject.useAdd && this.#lineObject.useAdd == false && this.#lineObject.useTrash == undefined )
        {
            if( this.#actions ) { this.#actions.remove(); }
        }

        if( this.#info )
        {
            if( this.#lineObject.info !== undefined )
            {
                this.#info.style.display = "flex";
                this.#tooltip = new AxialTooltip( "Cliquez pour en savoir plus" );
                AxialTooltipManager.addTooltip( this.#tooltip );
                this.#tooltip.target = this.#info;
                this.#info.addEventListener("click", this.#boundInfoClickHandler);
            }
        }
        

        if( this.#holder && this.#lineObject?.dir === "column" )
        {
            this.#holder.classList.add("axial_simulator_line-holder_column");
        }
        this.addEventListener("lineChanged", this.#boundLineChangedHandler );

        if( this._buildLine ) { this._buildLine(); }

    }

    /**
     * @abstract
     */
    _buildLine() {}

    /**
     * @abstract
     */
    _onSavedData()
    {
        
        if( this.#savedData.wasAdded == undefined )
        {
            if( this.#actions ) { this.#actions.remove(); }
        }
        else
        { 
            if( this.#actions ) { this.#actions.style.display = "flex"; }
            if( this.#savedData.wasAdded == false )
            {
                this.#useAdd = true;
                this.#useTrash = false;
                if( this.#trashButton ) { this.#trashButton.style.display = "none"; }
                if( this.#plusButton ) { this.#plusButton.style.display = "block"; }

            } 
            else
            {
                this.#useAdd = false;
                this.#useTrash = true;
                if( this.#plusButton ) { this.#plusButton.style.display = "none"; }
                if( this.#trashButton ) { this.#trashButton.style.display = "block"; }
            }
        }
        
    }

    /**
     * @abstract
     */
    _getCalculation() {}


    /**
     * @abstract
     * @param { Boolean } value 
     */
    _setEnabled( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
    }

    
    #infoClickHandler( event )
    {
        const infoData = this.#lineObject.info;
        /** @type { AxialHelpOverlay } */
        const helpOverlay = document.getElementById("helpOverlay");
        
        if( helpOverlay )
        {
            helpOverlay.data = infoData;
        }
        helpOverlay.show();
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #lineChangedHandler( event )
    {
        this.#isCompleted = event.detail.completed;
        const stepLineEvent = new CustomEvent("stepLineChanged", { detail: { completed: this.#isCompleted } } );
        this.dispatchEvent(stepLineEvent);
    }

    #trashHandler( event )
    {
        const lineEvent = new CustomEvent("lineDelete", { bubbles: true } );
        this.dispatchEvent(lineEvent);
    }


    #plusHandler( event )
    {
        const lineEvent = new CustomEvent( "lineDuplicate", { bubbles: true, composed: true, detail: { line: this } } );
        this.dispatchEvent( lineEvent );
    }

}

window.customElements.define("axial-simulator-line", AxialSimulatorLine);
export { AxialSimulatorLine }
