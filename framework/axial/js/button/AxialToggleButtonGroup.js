"use strict"

import { AxialToggleButtonBase } from "./AxialToggleButtonBase";
import { AxialToggleButtonGroupBase } from "./AxialToggleButtonGroupBase";

class AxialToggleButtonGroup extends AxialToggleButtonGroupBase
{
    /** @type { HTMLDivElement } */
    #holder;

    constructor()
    {
        super();
        this.template = "axial-toggle-button-group-template";
    }

    _finalizeComponent()
    {
        // ui : check the children length and get the holder
        const children = this.shadowRoot.children;
        const childrenLength = children.length;
        if( childrenLength != 2 ) { throw new Error("AxialToggleButtonGroup seems to not have the correct template"); }

        const tempHolder = children[1];
        if( tempHolder.classList.contains("axial_toggle_button_group-holder") == true )
        {
            this.#holder = tempHolder;
        }

        const slot = this.#holder.children[0];
        if( slot == undefined || slot == null ) { throw new Error("AxialToggleButtonGroup seems to not have the correct template"); }

        const tempToggles = slot.assignedElements();
        const tempTogglesLength = tempToggles.length;
        if( tempTogglesLength > 0 )
        {
            for( let i = 0; i < tempTogglesLength; i++ )
            {
                const tempToggle = tempToggles[i];
                if( tempToggle instanceof AxialToggleButtonBase == true )
                {
                    this.add(tempToggle);
                }
                else
                {
                    throw new Error("Elements in an AxialToggleButtonGroup must be or extends AxialToggleButtonBase");
                }
            }
        }
    }
}

window.customElements.define("axial-toggle-button-group", AxialToggleButtonGroup);

export { AxialToggleButtonGroup }