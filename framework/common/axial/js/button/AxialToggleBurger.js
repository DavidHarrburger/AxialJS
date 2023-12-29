"use strict"

import { AxialToggleButtonBase } from "./AxialToggleButtonBase.js";

class AxialToggleBurger extends AxialToggleButtonBase
{
    constructor()
    {
        super();
    }
}

window.customElements.define("axial-toggle-burger", AxialToggleBurger);
export { AxialToggleBurger }