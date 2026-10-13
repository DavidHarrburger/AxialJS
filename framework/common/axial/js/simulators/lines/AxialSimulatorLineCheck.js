"use strict";

import { AxialSimulatorLine } from "../AxialSimulatorLine.js";
import { AxialToggleCheck } from "../../button/AxialToggleCheck.js";

class AxialSimulatorLineCheck extends AxialSimulatorLine
{
    /// elements
    /** @type { HTMLElement } */
    #group;

    /// events
    /** @type { Function } */
    #boundToggleHandler;

    constructor()
    {
        super();
        this.template = "axial-simulator-line-check-template";
        this.#boundToggleHandler = this.#toggleHandler.bind(this);
    }

    _buildComponent()
    {
        this.#group = this.shadowRoot.getElementById("group");
        super._buildComponent();
    }

    _getCalculation()
    {
        const toggles = Array.from(this.#group.children);
        let selectedToggles = [];
        for( const t of toggles )
        {
            if( t.selected ) { selectedToggles.push(t.data); }
        }
        return selectedToggles;
    }

    _getAsObject()
    {
        const toggles = Array.from(this.#group.children);
        let selectedToggles = [];
        for( const t of toggles )
        {
            if( t.selected == true ) { selectedToggles.push(t.data); }
        }
        
        let obj =
        {
            key: this.line.key,
            wasAdded: this.useTrash,
            selected: selectedToggles
        };

        return obj;
    }

    _buildLine()
    {
        super._buildLine();

        const keys = this.line.articles;
        const len = keys.length;
        for( let i = 0; i < len; i++ )
        {
            const check = new AxialToggleCheck();
            check.addEventListener("toggleChanged", this.#boundToggleHandler);
            check.text = "";//this.line.nameOverrides[i] ?? "";
            check.data = keys[i];
            this.#group.appendChild(check);
        }
    }

    _onSavedData()
    {
        //console.warn("CHECKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK", this.savedData);
        if( this.savedData != undefined && this.savedData.selected != undefined )
        {
            const checks = Array.from( this.#group.children );
            const check = checks[0];
            if( check && this.savedData.selected.length >0)
            {
                check.selected = true;
                this.isCompleted = true;
            }
        }
    }

    /**
     * 
     * @param { Boolean } value 
     */
    _setEnabled( value )
    {
        super._setEnabled( value );
        const checks = Array.from( this.#group.children );
        for( const toggle of checks )
         {
            toggle.enabled = value;
        }
                
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #toggleHandler( event )
    {
        const lineEvent = new CustomEvent("lineChanged", { bubbles: true, detail: { completed: true } } );
        this.dispatchEvent(lineEvent);
    }
}

window.customElements.define("axial-simulator-line-check", AxialSimulatorLineCheck);
export { AxialSimulatorLineCheck }