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
            if( t.selected ) { selectedToggles.push(t.data); }
        }

        let obj =
        {
            selected: selectedToggles
        };

        return obj;
    }

    _buildLine()
    {
        super._buildLine();

        const cvs = this.line?.check_values
        if( cvs && Array.isArray( cvs ) )
        {
            for( const cv of cvs )
            {
                const check = new AxialToggleCheck();
                check.addEventListener("toggleChanged", this.#boundToggleHandler);
                check.text = cv.text;
                check.data = cv.name;
                this.#group.appendChild(check);
            }
        }
    }

    _onSavedData()
    {
        console.log("radio saved data", this.savedData);
        if( this.savedData && this.savedData.selected )
        {
            const checks = Array.from( this.#group.children );
            for( const toggle of checks )
            {
                console.log( toggle)
                if( this.savedData.selected.indexOf( toggle.data ) >= 0  )
                {
                    toggle.selected = true;
                    this.isCompleted = true;
                }
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