"use strict";

import { AxialSimulatorLine } from "../AxialSimulatorLine.js";

class AxialSimulatorLineNum extends AxialSimulatorLine
{
    /// elements
    /** @type { HTMLInputElement } */
    #numInput;

    /** @type { HTMLElement } */
    #unitLabel;

    /// events
    /** @type { Function } */
    #boundInputHandler;

    constructor()
    {
        super();
        this.template = "axial-simulator-line-num-template";
        this.#boundInputHandler = this.#inputHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    _buildLine()
    {
        super._buildLine();

        this.#unitLabel = this.shadowRoot.getElementById("unitLabel");
        if( this.line.unit && this.line.unit !== "" )
        {
            this.#unitLabel.innerHTML = this.line.unit;
        }

        this.#numInput = this.shadowRoot.getElementById("numInput");
        this.#numInput.addEventListener("focusout", this.#boundInputHandler);
    }

    /**
     * 
     * @param { Boolean } value 
     */
    _setEnabled( value )
    {
        super._setEnabled( value );
        this.#numInput.disabled = !value;
    }

    _getCalculation()
    {
        const n = isNaN( this.#numInput.valueAsNumber ) === true ? 0 : this.#numInput.valueAsNumber;
        return n;
    }

    #inputHandler( event )
    {
        const n = isNaN( this.#numInput.valueAsNumber ) === true ? 0 : this.#numInput.valueAsNumber;
        let tempCompleted = false;
        if( n >  0 )
        {
            tempCompleted = true;
        }
        const lineEvent = new CustomEvent("lineChanged", { bubbles: true, detail: { completed: tempCompleted } } );
        this.dispatchEvent(lineEvent);
    }

    _getAsObject()
    {
        let obj =
        {
            num: isNaN( this.#numInput.valueAsNumber ) === true ? 0 : this.#numInput.valueAsNumber
        }
        return obj;
    }

    _onSavedData()
    {
        if( this.savedData && this.savedData.num && this.#numInput && this.savedData.num > 0 )
        {
            this.#numInput.valueAsNumber = this.savedData.num;
            this.isCompleted = true;
        }
        else
        {
            this.isCompleted = false;
        }
    }
}

window.customElements.define("axial-simulator-line-num", AxialSimulatorLineNum);
export { AxialSimulatorLineNum }