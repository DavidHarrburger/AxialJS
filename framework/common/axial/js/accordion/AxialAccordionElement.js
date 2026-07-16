"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialAccordionContainer } from "./AxialAccordionContainer.js";
import { AxialAccordionToggle } from "./AxialAccordionToggle.js";

class AxialAccordionElement extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #text;

    /** @type { String } */
    #dataTextProperty;

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

    static get observedAttributes()
    {
        return ["axial-text" ];
    }

    /**
     * @type { AxialAccordionToggle }
     * @readonly
     */
    get toggle() { return this.#toggle; }

    /**
     * @type { AxialAccordionContainer }
     * @readonly
     */
    get container() { return this.#container; }

    get text() { return this.#text; }
    set text( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#text = value;
        
        if( this.#toggle )
        {
            this.#toggle.text = this.#text;
        }
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);

        if( name === "axial-text" )
        {
            this.#text = newValue;
            if( this.#toggle )
            {
                this.#toggle.text = this.#text;
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#container = this.shadowRoot.getElementById("container");
        this.#toggle = this.shadowRoot.getElementById("toggle");
        this.#toggle.container = this.#container;

        if( this.#text !== undefined )
        {
            this.#toggle.text = this.#text;
        }
    }

    /**
     * 
     * @param { HTMLElement } element 
     */
    addElement( element )
    {
        if( element && element instanceof HTMLElement && this.#container )
        {
            this.#container.addElement(element);
        }
    }
}

window.customElements.define("axial-accordion-element", AxialAccordionElement);
export { AxialAccordionElement }