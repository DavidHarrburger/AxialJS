"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialProgressIndicator extends AxialComponentBase
{
    /// vars
    /** @type { Number } */
    #size = 24;

    /** @type { String } */
    #animation = "axialProgressIndicatorAnimation 2s ease 0s infinite";

    /// elements
    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLElement } */
    #indicator;

    constructor()
    {
        super();
        this.classList.add("axial_progress_indicator");
        this.template = "axial-progress-indicator-template";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#holder = this.shadowRoot.getElementById("holder");
        this.#indicator = this.shadowRoot.getElementById("indicator");
    }

    show()
    {
        if( this.#indicator )
        {
            this.style.width = `${this.#size}px`;
            this.#indicator.style.animation = this.#animation;
        }
    }

    hide()
    {
        if( this.#indicator )
        {
            this.style.width = "0";
            this.#indicator.style.animation = "none";
        }
    }
}

window.customElements.define("axial-progress-indicator", AxialProgressIndicator);
export { AxialProgressIndicator }