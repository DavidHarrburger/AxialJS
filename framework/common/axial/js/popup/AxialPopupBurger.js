"use strict"

import { AxialPopupBase } from "./AxialPopupBase.js";

class AxialPopupBurger extends AxialPopupBase
{

    constructor()
    {
        super();
        this.classList.add("axial_popup_burger");
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.useObfuscator = true;
        this.displayMode = "window";
        this.horizontalAlignment = "right";
        this.animation = "translate_left";
    }

}

window.customElements.define("axial-popup-burger", AxialPopupBurger);
export { AxialPopupBurger }