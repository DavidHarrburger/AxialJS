"use strict";

import { AxialSimulatorLine } from "../AxialSimulatorLine.js";
import { AxialToggleButtonGroup } from "../../button/AxialToggleButtonGroup.js";
import { AxialToggleRadio } from "../../button/AxialToggleRadio.js";

class AxialSimulatorLineRadio extends AxialSimulatorLine
{
    /// elements
    /** @type { AxialToggleButtonGroup } */
    #group;

    /// events
    /** @type { Function } */
    #boundIndexChangedHandler;

    constructor()
    {
        super();
        this.template = "axial-simulator-line-radio-template";
        this.#boundIndexChangedHandler = this.#indexChangedHandler.bind(this);
    }

    _buildComponent()
    {
        this.#group = this.shadowRoot.getElementById("group");
        this.#group.forceSelection = true;
        this.#group.addEventListener("indexChanged", this.#boundIndexChangedHandler);
        super._buildComponent();
    }

    _buildLine()
    {
        super._buildLine();

        /*
        const rvs = this.line?.radio_values;
        if( rvs && Array.isArray( rvs ) )
        {
            for( const rv of rvs )
            {
                const radio = new AxialToggleRadio();
                radio.text = rv.text;
                radio.data = rv.name;
                this.#group.appendToggle(radio);
            }
        }
        */
        const radioKeys = this.line.articles;
        const len = radioKeys.length;
        for( let i = 0; i < len; i++ )
        {
            const radio = new AxialToggleRadio();
            radio.text = this.line.nameOverrides[i];
            radio.data = radioKeys[i];
            this.#group.appendToggle(radio);
        }
    }

    _getCalculation()
    {
        return this.#group.getSelectedToggle()?.data;
    }

    _getAsObject()
    {
        let obj =
        {
            key: this.line.key,
            wasAdded: this.useTrash,
            selected: this.#group.getSelectedToggle()?.data,
            index: this.#group.selectedIndex
        }
        return obj;
    }

    _onSavedData()
    {
        if( this.savedData != undefined && this.savedData.index != undefined )
        {
            this.#group.selectedIndex = this.savedData.index;
            this.isCompleted = true;
            //const toggle = this.#group.toggles[this.#group.selectedIndex];
            /*
            const toggles = this.#group.toggles;
            const tl = toggles.length;
            for( let i = 0; i < tl; i++ )
            {
                const toggle = toggles[i];
                if( toggle.data === this.savedData.selected )
                {
                    this.#group.selectedIndex = i;
                    this.isCompleted = true;
                }
            }
            */
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
        for( const toggle of this.#group.toggles )
        {
            toggle.enabled = value;
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

window.customElements.define("axial-simulator-line-radio", AxialSimulatorLineRadio);
export { AxialSimulatorLineRadio }