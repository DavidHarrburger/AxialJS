"use strict"

import { AxialToggleButtonBase } from "./AxialToggleButtonBase";

class AxialToggleBurger extends AxialToggleButtonBase
{
    constructor()
    {
        super();
    }
}

window.customElements.define("axial-toggle-burger", AxialToggleBurger);
export { AxialToggleBurger }