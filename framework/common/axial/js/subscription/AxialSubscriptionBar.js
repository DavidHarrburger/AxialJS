"use strict";

import { AxialToggleButtonGroup } from "../button/AxialToggleButtonGroup.js";


class AxialSubscriptionBar extends AxialToggleButtonGroup
{
    /** @type { HTMLElement } */
    #fluid;

    constructor()
    {
        super();
        this.classList.add("axial_subscription_bar")
        this.template = "axial-subscription-bar-template";
        this.forceSelection = true;
        
    }
    get selectedIndex() { return super.selectedIndex; }
    set selectedIndex( value )
    {
        super.selectedIndex = value;
        this.#updateFluid();
    }

    _buildComponent()
    {
        this.#fluid = this.shadowRoot.getElementById("fluid");
        super._buildComponent();
    }

    _onIndexChanged( newIndex )
    {
        super._onIndexChanged( newIndex );
        this.#updateFluid();
    }

    updateFluid()
    {
        this.#updateFluid();
    }

    #updateFluid()
    {
        const toggle = this.getSelectedToggle();
        if( toggle )
        {
            const l = toggle.offsetLeft;
            const w = toggle.offsetWidth;
            const h = toggle.offsetHeight;

            this.#fluid.style.width = w + "px";
            this.#fluid.style.height = h + "px";
            this.#fluid.style.left = (l+4) + "px";
        }
    }
}

window.customElements.define("axial-subscription-bar", AxialSubscriptionBar);
export { AxialSubscriptionBar }