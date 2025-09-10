"use strict";

import { AxialOverlayBase } from "./AxialOverlayBase.js";
import { AxialToggleButtonGroupBase } from "../button/AxialToggleButtonGroupBase.js";
import { AxialToggleButton } from "../button/AxialToggleButton.js";

class AxialListOverlay extends AxialOverlayBase
{
    /// elements
    /** @type { AxialToggleButtonGroupBase } */
    #group;

    /// events
    /** @type { Function } */
    #boundIndexChangedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_list_overlay");
        this.template = "axial-list-overlay-template";
        this.#boundIndexChangedHandler = this.#indexChangedHandler.bind(this);
    }

    /**
     * @type { AxialToggleButtonGroupBase }
     * @readonly
     */
    get group() { return this.#group; }

    _buildComponent()
    {
        super._buildComponent();
        this.#group = this.shadowRoot.getElementById("group");
        this.#group.forceSelection = true;
        this.#group.addEventListener("indexChanged", this.#boundIndexChangedHandler);
    }

    #indexChangedHandler( event )
    {
        //console.log("list overlay group changed");
        //console.log( event );

        const index = event.detail.selectedIndex;
        const toggle = this.group.toggles[index];
        const label = toggle.text;
        const value = toggle.data;

        const eventDetail = 
        {
            index: index,
            label: label,
            value: value
        }

        const listEvent = new CustomEvent("listChanged", { bubbles: true, detail: eventDetail } );
        this.dispatchEvent(listEvent);

        this.hide();
    }


}

window.customElements.define("axial-list-overlay", AxialListOverlay);
export { AxialListOverlay }
