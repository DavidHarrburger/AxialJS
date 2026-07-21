"use strict";

import { AxialSimulatorLine } from "../AxialSimulatorLine.js";
import { AxialToggleButtonGroup } from "../../button/AxialToggleButtonGroup.js";
import { AxialToggleRadio } from "../../button/AxialToggleRadio.js";

class AxialSimulatorLineBoolean extends AxialSimulatorLine
{
    /// elements
    /** @type { AxialToggleRadio } */
    #yes;

    /** @type { AxialToggleRadio } */
    #no;

    /** @type { AxialToggleButtonGroup } */
    #group;

    /// events
    /** @type { Function } */
    #boundIndexChangedHandler;

    constructor()
    {
        super();
        this.template = "axial-simulator-line-boolean-template";
        this.#boundIndexChangedHandler = this.#indexChangedHandler.bind(this);
    }

    
    _buildComponent()
    {
        this.#yes = this.shadowRoot.getElementById("yes");
        this.#no = this.shadowRoot.getElementById("no");

        this.#group = this.shadowRoot.getElementById("group");
        this.#group.forceSelection = true;
        this.#group.addEventListener("indexChanged", this.#boundIndexChangedHandler);

        super._buildComponent();
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
        const bool = this.#group.selectedIndex === 0;
        return bool;
    }

    _getAsObject()
    {
        let obj =
        {
            index: this.#group.selectedIndex
        };

        return obj;
    }

    _onSavedData()
    {
        console.log("yes/no saved data", this.savedData);
        this.#group.selectedIndex = this.savedData.index;
        if( this.savedData.index != -1 )
        {
            this.isCompleted = true;
        }
        else
        {
            this.isCompleted = false;
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #indexChangedHandler( event )
    {
        const lineEvent = new CustomEvent("lineChanged", { bubbles: true, detail: { completed: true } } );
        this.dispatchEvent(lineEvent);
    }

}

window.customElements.define("axial-simulator-line-boolean", AxialSimulatorLineBoolean);
export { AxialSimulatorLineBoolean }