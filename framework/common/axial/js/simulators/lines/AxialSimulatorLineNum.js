"use strict";

import { AxialSimulatorLine } from "../AxialSimulatorLine.js";

class AxialSimulatorLineNum extends AxialSimulatorLine
{
    /// elements
    /** @type { HTMLInputElement } */
    #numInput;

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
        return this.#numInput.valueAsNumber;
    }

    #inputHandler( event )
    {
        console.log( "num focus out");
        const n = this.#numInput.valueAsNumber;
        console.log( n )
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
            num: this.#numInput.valueAsNumber
        }
        return obj;
    }

    _onSavedData()
    {
        console.log( "saved data in num line", this.savedData );
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