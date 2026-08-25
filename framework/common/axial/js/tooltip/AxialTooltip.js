"use strict";

import { AxialTooltipBase } from "./AxialTooltipBase.js";

class AxialTooltip extends AxialTooltipBase
{
    /// vars
    /** @type { String } */
    #text;

    /// elements
    /** @type { HTMLElement } */
    #textElement;

    constructor( tipText )
    {
        super();
        this.classList.add("axial_toolip");
        this.template = "axial-tooltip-template";

        if( tipText && typeof tipText === "string" )
        {
            this.#text = tipText;
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#textElement = this.shadowRoot.getElementById("textElement");
        if( this.#textElement && this.#text !== undefined )
        {
            this.#textElement.innerText = this.#text;
        }
        
    }
}

window.customElements.define("axial-tooltip", AxialTooltip);
export { AxialTooltip }