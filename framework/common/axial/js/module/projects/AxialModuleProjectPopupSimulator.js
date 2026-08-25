"use strict";

import { AxialModulePopup } from "../../popup/AxialModulePopup.js";
import { AxialSimulator } from "../../simulators/AxialSimulator.js";

class AxialModuleProjectPopupSimulator extends AxialModulePopup
{
    /** @type { Object } */
    #project;

    /** @type { Object } */
    #simulation;

    /** @type { AxialSimulator } */
    #simulator;

    constructor()
    {
        super();
        this.template = "axial-module-project-popup-simulator-template";
    }

    /**
     * @readonly
     * @type { AxialSimulator }
     */
    get simulator() { return this.#simulator; }

    _buildComponent()
    {
        super._buildComponent();
        this.#simulator = this.shadowRoot.getElementById("simulator");
    }

    _onDataChanged()
    {
        this.title = this.data.simulation_name;
        if( this.#simulator ) { this.#simulator.data = this.data; }
    }

    _onHidden()
    {
        if( this.#simulator ) { this.#simulator.clearSteps(); }
    }
}

window.customElements.define("axial-module-project-popup-simulator", AxialModuleProjectPopupSimulator);
export { AxialModuleProjectPopupSimulator }