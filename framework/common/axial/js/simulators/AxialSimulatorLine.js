"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";

class AxialSimulatorLine extends AxialComponentBase
{
    /// vars
    /** @type { Object } */
    #lineObject;

    /** @type { HTMLElement } */
    #label;

    /** @type { HTMLElement } */
    #holder;

    /** @type { Boolean } */
    #isCompleted = true;

    /** @type { Boolean } */
    #isRequired = false;

    /// events
    /** @type { Function } */
    #boundLineChangedHandler;

    /** @type { Object } */
    #savedData;

    constructor()
    {
        super();
        this.classList.add("axial_simulator_line");
        this.template = "axial-simulator-line-template";
        this.#boundLineChangedHandler = this.#lineChangedHandler.bind(this);
    }

    /**
     * @type { Boolean }
     * @readonly
     */
    get isRequired() { return this.#isRequired; }

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
        const required = this.#lineObject.required;
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
        this.#holder = this.shadowRoot.getElementById("holder");

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
        this.#isRequired = this.#lineObject.required;
        if( this.#lineObject.required && this.#lineObject.required === true )
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
    _onSavedData() {}

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

}

window.customElements.define("axial-simulator-line", AxialSimulatorLine);
export { AxialSimulatorLine }
