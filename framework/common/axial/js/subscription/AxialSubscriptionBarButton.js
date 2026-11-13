"use strict";

import { AxialToggleButtonBase } from "../button/AxialToggleButtonBase.js";

class AxialSubscriptionBarButton extends AxialToggleButtonBase
{
    /// var
    /** @type { String } */
    #text;
    
    /// elements
    /** @type { HTMLElement } */
    #label;

    constructor()
    {
        super();
        this.classList.add("axial_subscription_bar_button")
        this.template = "axial-subscription-bar-button-template";
    }

    get text() { return this.#text; }
    set text( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        if( this.#text === value ) { return; }
        this.#text = value;
        if( this.#label )
        {
            this.#label.innerHTML = this.#text;
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#label = this.shadowRoot.getElementById("label");
        if( this.#text )
        {
            this.#label.innerHTML = this.#text;
        }
    }

    _onToggleChanged()
    {
        const color = this.selected === true ? "#fff" : "#111";
        this.#label.style.color = color;
    }
}

window.customElements.define("axial-subscription-bar-button", AxialSubscriptionBarButton);
export { AxialSubscriptionBarButton }