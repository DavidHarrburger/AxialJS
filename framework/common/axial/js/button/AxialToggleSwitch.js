"use strict";

import { AxialToggleButtonBase } from "./AxialToggleButtonBase.js";
import { ColorUtils } from "../utils/ColorUtils.js";

class AxialToggleSwitch extends AxialToggleButtonBase
{
    /// vars
    /** @type { String } */
    #unselectedLeft = "translateX(0)";

    /** @type { String } */
    #selectedLeft = "translateX(14px)";

    /// styles
    /** @type { String } */
    #themeColor = ColorUtils.GREEN.mid_dark;
    
    /** @type { String } */
    #borderColor = "#000";

    /// elements
    /** @type { HTMLElement } */
    #circle;

    /** @type { HTMLElement } */
    //#inner;

    constructor()
    {
        super();
        this.classList.add("axial_toggle_switch");
        this.template = "axial-toggle-switch-template";
    }

    static get observedAttributes()
    {
        return [ "axial-theme", "axial-border" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);

        if( name === "axial-theme" )
        {
            if( CSS.supports( "color", newValue) === true )
            {
                this.#themeColor = newValue;
                this.style.backgroundColor = this.#themeColor;
            }
        }

        if( name === "axial-border" )
        {
            this.#borderColor = newValue;
        }
    }

    _buildComponent()
    {
        this.#circle = this.shadowRoot.getElementById("circle");
        this._onToggleChanged();
    }

    _onToggleChanged()
    {
        super._onToggleChanged();
        
        if( this.#circle )
        {
            if( this.selected === true )
            {
                this.#circle.style.transform = this.#selectedLeft;
            }
            else
            {
                this.#circle.style.transform = this.#unselectedLeft;
            }
        }

        if( this.selected === true )
        {
            this.style.backgroundColor = this.#themeColor;
        }
        else
        {
            this.style.backgroundColor = "#fff";
        }
    }
}

window.customElements.define("axial-toggle-switch", AxialToggleSwitch);
export { AxialToggleSwitch }