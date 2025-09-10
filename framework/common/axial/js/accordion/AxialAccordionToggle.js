"use strict";

import { AxialToggleButton } from "../button/AxialToggleButton.js";
import { AxialAccordionContainer } from "./AxialAccordionContainer.js";

class AxialAccordionToggle extends AxialToggleButton
{
    /** @type { HTMLElement } */
    #arrow;

    /** @type { AxialAccordionContainer } */
    #container;

    constructor()
    {
        super();
        this.classList.add("axial_accordion_toggle");
        this.template = "axial-accordion-toggle-template";
    }

    get container() { return this.#container; }
    set container( value )
    {
        if( value instanceof AxialAccordionContainer === false )
        {
            throw new TypeError("AxialAccordionContainer value required");
        }
        this.#container = value;
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#arrow = this.shadowRoot.getElementById("arrow");
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
    }

    _onToggleChanged()
    {
        super._onToggleChanged();

        if( this.#arrow )
        {
            if( this.selected === false )
            {
                this.#arrow.style.transform = "rotate(0deg)";
            }
            else
            {
                this.#arrow.style.transform = "rotate(90deg)";
            }
        }

        if( this.#container )
        {
            if( this.selected === false )
            {
                this.#container.close();
            }
            else
            {
                this.#container.open();
            }
        }
    }
}

window.customElements.define("axial-accordion-toggle", AxialAccordionToggle);
export { AxialAccordionToggle }
