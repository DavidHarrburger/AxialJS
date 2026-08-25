"use strict";

import { AxialSimulatorStep } from "../AxialSimulatorStep.js";
import { AxialToggleButtonGroup } from "../../button/AxialToggleButtonGroup.js";
import { AxialToggleCheck } from "../../button/AxialToggleCheck.js";

class AxialSimulatorStepSelection extends AxialSimulatorStep
{
    /** @type { HTMLElement } */
    #selectionGroup;

    /** @type { Array<AxialToggleCheck> } */
    #toggles = [];

    /** @type { Function } */
    #boundToggleChangedHandler;

    /** @type { Function } */
    #boundNextHandler;

    constructor()
    {
        super();
        this.template = "axial-simulator-step-selection-template";
        this.stepName = "AxialSimulatorStepSelection";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#selectionGroup = this.shadowRoot.getElementById("selectionGroup");
        this.#boundToggleChangedHandler = this.#toggleChangedHandler.bind(this);
        this.#boundNextHandler = this.#nextHandler.bind(this);
        this.nextButton.enabled = false;
    }

    _buildStep()
    {
        super._buildStep();
        const simulators = this.data.simulators;
        for( const sim of simulators )
        {
            const toggle = new AxialToggleCheck();
            toggle.text = sim.name;
            toggle.data = sim.id;
            toggle.addEventListener("toggleChanged", this.#boundToggleChangedHandler);
            this.#selectionGroup.appendChild( toggle );
            this.#toggles.push( toggle );
        }
    }

    #toggleChangedHandler( event )
    {
        let isValid = false;
        for( const t of this.#toggles )
        {
            if( t.selected == true )
            {
                isValid = true;
                break;
            }
        }
        //console.log(isValid);
        this.nextButton.enabled = isValid;
    }

    _onNextStep()
    {
        let simulatorsToBuild = [];
        for( const toggle of this.#toggles )
        {
            if( toggle.selected === true )
            {
                simulatorsToBuild.push( toggle.data );
            }
        }

        console.log("check data in selection", this.savedData);

        const stepEvent = new CustomEvent( "stepCreate", { bubbles: true, detail: { simulators: simulatorsToBuild } } );
        this.dispatchEvent( stepEvent );

        const projectEvent = new CustomEvent( "projectSave", { bubbles: true } );
        this.dispatchEvent( projectEvent );
    }

    /**
     * @deprecated
     * @param { PointerEvent } event 
     */
    #nextHandler( event )
    {
        console.log( "stop" )
        event.preventDefault();
        event.stopPropagation();
    }

    _getAsObject()
    {
        let obj =
        {
            class: "AxialSimulatorStepSelection",
            selectedSimulators: []
        };
        for( const t of this.#toggles )
        {
            if( t.selected === true )
            {
                obj.selectedSimulators.push(t.data);
            }
        }
        return obj;
    }

    _reinit()
    {
        for( const toggle of this.#toggles )
        {
            toggle.selected = false;
            toggle.enabled = true;
        }
    }

    _onSavedData()
    {
        console.log("saved project step selection");
        const selectedSimulators = this.savedData.selectedSimulators;
        const enabled = this.savedData.selectedSimulators.length === 0;
        
        for( const toggle of this.#toggles )
        {
            //toggle.enabled = enabled;
            const toggleData = toggle.data;
            if( selectedSimulators.indexOf(toggleData) >= 0 )
            {
                toggle.selected = true;
                toggle.enabled = false;
                
            }
            else
            {
                toggle.selected = false;
                toggle.enabled = true;
            }
        }
        this.nextButton.enabled = !enabled;
    }
    
}

window.customElements.define("axial-simulator-step-selection", AxialSimulatorStepSelection);
export { AxialSimulatorStepSelection }