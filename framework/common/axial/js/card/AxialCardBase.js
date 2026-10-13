"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";

class AxialCardBase extends AxialServiceComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_card_base");
    }

    static get observedAttributes()
    {
        return [ "axial-grid-col", "axial-grid-row" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-grid-col" )
        {
            if( CSS.supports("grid-column", newValue) === true ) 
            {
                this.style.gridColumn = newValue;
            }
        }

        if( name === "axial-grid-row" )
        {
            if( CSS.supports("grid-row", newValue) === true ) 
            {
                this.style.gridRow = newValue;
            }
        }
    }
}

window.customElements.define("axial-card-base", AxialCardBase);
export { AxialCardBase }