"use strict";

import { AxialSimulatorLine } from "../AxialSimulatorLine.js";
import { AxialButton } from "../../button/AxialButton.js";

class AxialSimulatorLineDim extends AxialSimulatorLine
{
    /** @type { HTMLInputElement } */
    #lenInput;

    /** @type { HTMLInputElement } */
    #widInput;

    /** @type { AxialButton } */
    #deleteButton;

    /// events
    /** @type { Function } */
    #boundInputHandler;

    /** @type { Function } */
    #boundDeleteHandler;

    constructor()
    {
        super();
        this.template = "axial-simulator-line-dim-template";
        this.#boundInputHandler = this.#inputHandler.bind(this);
        this.#boundDeleteHandler = this.#deleteHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    _buildLine()
    {
        super._buildLine();

        this.#deleteButton = this.shadowRoot.getElementById("deleteButton");
        if( this.line.deletable && this.line.deletable == true )
        {
            this.#deleteButton.style.display = "block";
            this.#deleteButton.addEventListener("click", this.#boundDeleteHandler);
        }

        this.#lenInput = this.shadowRoot.getElementById("lenInput");
        this.#widInput = this.shadowRoot.getElementById("widInput");

        this.#lenInput.addEventListener("focusout", this.#boundInputHandler);
        this.#widInput.addEventListener("focusout", this.#boundInputHandler);
    }

    /**
     * 
     * @param { InputEvent } event 
     */
    #inputHandler( event )
    {
        const len = this.#lenInput.valueAsNumber;
        const wid = this.#widInput.valueAsNumber;
        let tempCompleted = false;
        if( len > 0 && wid > 0 )
        {
            tempCompleted = true;
        }
        const lineEvent = new CustomEvent("lineChanged", { bubbles: true, detail: { completed: tempCompleted } } );
        this.dispatchEvent(lineEvent);
    }

    /**
     * 
     * @param { Boolean } value 
     */
    _setEnabled( value )
    {
        super._setEnabled( value );
    }

    _getCalculation()
    {
        const len = this.#lenInput.valueAsNumber;
        const wid = this.#widInput.valueAsNumber;
        const sum = len + wid;
        const mul = len * wid;
        return [len, wid, sum, mul]; 
    }

    _getAsObject()
    {
        const len = this.#lenInput.valueAsNumber;
        const wid = this.#widInput.valueAsNumber;

        let obj = 
        {
            len: len,
            wid: wid
        }
        return obj;
    }

    _onSavedData()
    {
        
        if( this.savedData.len ) { this.#lenInput.valueAsNumber = this.savedData.len; }
        if( this.savedData.wid ) { this.#widInput.valueAsNumber = this.savedData.wid; }

        if( this.savedData.len && this.savedData.len > 0 && this.savedData.wid && this.savedData.wid > 0 )
        {
            this.isCompleted = true;
        }
        else
        {
            this.isCompleted = false;
        }
    }

    #deleteHandler( event )
    {
        const lineEvent = new CustomEvent("lineDelete", { bubbles: true } );
        this.dispatchEvent(lineEvent);
    }
}

window.customElements.define("axial-simulator-line-dim", AxialSimulatorLineDim);
export { AxialSimulatorLineDim }