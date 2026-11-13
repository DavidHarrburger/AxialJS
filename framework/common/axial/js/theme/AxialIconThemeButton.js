"use strict";

import { AxialThemeManager } from "./AxialThemeManager.js";
import { AxialIconButton } from "../button/AxialIconButton.js";

class AxialIconThemeButton extends AxialIconButton
{
    /** @type { Function } */
    #boundClickHandler;

    constructor()
    {
        super();
        this.iconName = AxialThemeManager.getTheme();
        this.#boundClickHandler = this.#clickHandler.bind(this)
        this.addEventListener("click", this.#boundClickHandler);
    }

    #clickHandler( event )
    {
        this.iconName = AxialThemeManager.toggleTheme();
    }
}

window.customElements.define("axial-icon-theme-button", AxialIconThemeButton);
export { AxialIconThemeButton }