"use strict";

import { AxialView } from "./AxialView.js";

class AxialModuleView extends AxialView
{
    /** @type { String } */
    #title;

    /** @type { HTMLElement } */
    #titleElement;

    constructor()
    {
        super();
        this.template = "axial-module-view-template";
    }

    static get observedAttributes()
    {
        return [ "axial-title" ];
    }

    get title() { return this.#title; }
    set title( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#title = value.trim();
        if( this.#titleElement )
        {
            this.#titleElement.innerHTML = this.#title;
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#titleElement = this.shadowRoot.getElementById("title");
        if( this.#titleElement && this.#title !== undefined )
        {
            this.#titleElement.innerHTML = this.#title;
        }
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-title" )
        {
            this.title = newValue;
        }
    }

}

window.customElements.define("axial-module-view", AxialModuleView);
export { AxialModuleView }