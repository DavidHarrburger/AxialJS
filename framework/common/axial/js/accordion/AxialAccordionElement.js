"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialAccordionContainer } from "./AxialAccordionContainer.js";
import { AxialAccordionToggle } from "./AxialAccordionToggle.js";

class AxialAccordionElement extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #text = "";

    /// elements
    /** @type { AxialAccordionToggle } */
    #toggle;

    /** @type { AxialAccordionContainer } */
    #container;

    constructor()
    {
        super();
        this.classList.add("axial_accordion_element");
        this.template = "axial-accordion-element-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#container = this.shadowRoot.getElementById("container");
        this.#toggle = this.shadowRoot.getElementById("toggle");
        this.#toggle.container = this.#container;
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        /*
        if( name === "axial-state" )
        {
            if( this.#states.has( newValue ) === true )
            {
                this.#state = newValue;
            }
        }
        */
    }

}

window.customElements.define("axial-accordion-element", AxialAccordionElement);
export { AxialAccordionElement }