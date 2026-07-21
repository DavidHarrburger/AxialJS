"use strict";

import { AxialSimulatorLine } from "../AxialSimulatorLine.js";
import { AxialButton } from "../../button/AxialButton.js";

class AxialSimulatorLineSelect extends AxialSimulatorLine
{
    /// element
    /** @type { HTMLSelectElement } */
    #select;

    /** @type { AxialButton } */
    #deleteButton;

    /** @type { Function } */
    #boundSelectHandler;

    /** @type { Function } */
    #boundDeleteHandler;

    constructor()
    {
        super();
        this.template = "axial-simulator-line-select-template";

        this.#boundSelectHandler = this.#selectHandler.bind(this);
        this.#boundDeleteHandler = this.#deleteHandler.bind(this);
    }

    _buildComponent()
    {
        this.#select = this.shadowRoot.getElementById("select");
        this.#select.addEventListener("change", this.#boundSelectHandler);

        this.#deleteButton = this.shadowRoot.getElementById("deleteButton");
        this.#deleteButton.addEventListener("click", this.#boundDeleteHandler);
        super._buildComponent();
    }

    _buildLine()
    {
        super._buildLine();
        const optValues = this.line?.select_values;
        if( optValues && Array.isArray( optValues ) )
        {
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.innerHTML = "Choisir les dimensions";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            defaultOption.hidden = true;
            this.#select.add(defaultOption);
            for( const optv of optValues )
            {
                const option = document.createElement("option");
                option.innerHTML = optv.text;
                option.value = optv.name;
                this.#select.add(option);
            }
        }
    }

    _getCalculation()
    {
        console.log("getCalculation from select", this.#select.value);
        return this.#select.value;
    }

    _getAsObject()
    {
        let obj = 
        {
            value: this.#select.value
        }
        return obj;
    }

    _onSavedData()
    {
        if( this.#select && this.savedData && this.savedData.value )
        {
            this.#select.value = this.savedData.value;
        }
        else
        {
            this.isCompleted = false;
        }
    }

    /**
     * 
     * @param { Boolean } value 
     */
    _setEnabled( value )
    {
        super._setEnabled( value );
    }

    #deleteHandler( event )
    {
        const lineEvent = new CustomEvent("lineDelete", { bubbles: true } );
        this.dispatchEvent(lineEvent);
    }

    #selectHandler( event )
    {
        console.log( "select" );
        const lineEvent = new CustomEvent("lineChanged", { bubbles: true, detail: { completed: true } } );
        this.dispatchEvent(lineEvent);
    }
}

window.customElements.define("axial-simulator-line-select", AxialSimulatorLineSelect);
export { AxialSimulatorLineSelect }