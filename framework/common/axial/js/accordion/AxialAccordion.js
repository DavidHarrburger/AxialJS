"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialAccordionElement } from "./AxialAccordionElement.js";

class AxialAccordion extends AxialComponentBase
{
    /// elements
    /** @type { HTMLElement } */
    #elements;

    /** @type { HTMLSlotElement } */
    #slot;

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
        this.#elements = this.shadowRoot.getElementById("elements");
        this.#slot = this.shadowRoot.getElementById("slot");

        const assigned = this.#slot.assignedElements();
    }

    /** @type { HTMLElement } */
    addElement( element )
    {
        if( element && this.#elements && element instanceof HTMLElement === true )
        {
            this.#elements.appendChild( element );
            if( element instanceof AxialAccordionElement === true )
            {
                this.#accordionElements.push( element );
            }
        }
    }
}

window.customElements.define("axial-accordion", AxialAccordion);
export { AxialAccordion }