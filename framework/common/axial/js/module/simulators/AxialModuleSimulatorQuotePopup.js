"use strict";

import { AxialModulePopup } from "../../popup/AxialModulePopup.js";
import { AxialSimulatorQuote } from "../../simulators/AxialSimulatorQuote.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleSimulatorQuotePopup extends AxialModulePopup
{
    /** @type { AxialSimulatorQuote } */
    #simulatorQuote;

    constructor()
    {
        super();
        this.template = "axial-module-simulator-quote-popup-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#simulatorQuote = this.shadowRoot.getElementById("simulatorQuote");
    }

    _onDataChanged()
    {
        super._onDataChanged();
        if( this.#simulatorQuote ) { this.#simulatorQuote.data = this.data; }
    }

}

window.customElements.define("axial-module-simulator-quote-popup", AxialModuleSimulatorQuotePopup);
export { AxialModuleSimulatorQuotePopup }