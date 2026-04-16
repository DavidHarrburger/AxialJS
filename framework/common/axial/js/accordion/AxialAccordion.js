"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialAccordionElement } from "./AxialAccordionElement.js";

class AxialAccordion extends AxialComponentBase
{
    /// elements
    /** @type { HTMLElement } */
    #content;

    /// var
    /** @type { Array<AxialAccordionElement> } */
    #accordionElements = new Array();

    constructor()
    {
        super();
        this.classList.add("axial_accordion")
        this.template = "axial-accordion-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#content = this.shadowRoot.getElementById("content");
    }

    /** @type { HTMLElement } */
    addElement( element )
    {
        if( element && this.#content && element instanceof HTMLElement === true )
        {
            this.#content.appendChild( element );
            if( element instanceof AxialAccordionElement === true )
            {
                this.#accordionElements.push( element );
            }
        }
    }
}

window.customElements.define("axial-accordion", AxialAccordion);
export { AxialAccordion }