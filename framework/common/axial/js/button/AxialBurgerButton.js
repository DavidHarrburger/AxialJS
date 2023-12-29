"use strict"

import { AxialPopupManager } from "../popup/AxialPopupManager.js";
import { AxialToggleButtonBase } from "./AxialToggleButtonBase.js";

class AxialBurgerButton extends AxialToggleButtonBase
{
    /** @type { Number } */
    #topPosition = 13;

    /** @type { Number } */
    #middlePosition = 23;

    /** @type { Number } */
    #bottomPosition = 33;

    /** @type { Number } */
    #lineWidth = 26;

    /** @type { HTMLElement } */
    #top;

    /** @type { HTMLElement } */
    #middle;

    /** @type { HTMLElement } */
    #bottom;

    constructor()
    {
        super();
        this.classList.add("axial_burger_button");
        this.template = "axial-burger-button-template";
    }

    connectedCallback()
    {
        super.connectedCallback();

        this.#top = this.shadowRoot.getElementById("top");
        this.#middle = this.shadowRoot.getElementById("middle");
        this.#bottom = this.shadowRoot.getElementById("bottom");
    }

    _finalizeComponent()
    {
        this.popup = AxialPopupManager.getPopupById("axialPopupBurger");
    }

    _onToggleChanged()
    {
        super._onToggleChanged();

        if( this.selected === true )
        {
            this.#middle.style.transform = "scaleX(0)";

            this.#top.style.top = String(this.#middlePosition) + "px";
            this.#top.style.transform = "rotate(45deg)";

            this.#bottom.style.top = String(this.#middlePosition) + "px";
            this.#bottom.style.transform = "rotate(-45deg)";
            
        }
        else
        {
            this.#middle.style.transform = "scaleX(1)";

            this.#top.style.top = String(this.#topPosition) + "px";
            this.#top.style.transform = "rotate(0deg)";

            this.#bottom.style.top = String(this.#bottomPosition) + "px";
            this.#bottom.style.transform = "rotate(0deg)";
        }
    }
}

window.customElements.define("axial-burger-button", AxialBurgerButton);
export { AxialBurgerButton }