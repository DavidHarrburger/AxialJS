"use strict";

import { AxialOverlayBase } from "./AxialOverlayBase.js";
import { AxialToggleButtonGroupBase } from "../button/AxialToggleButtonGroupBase.js";
import { AxialDropdownToggle } from "../dropdown/AxialDropdownToggle.js";
import { AxialListOverlayButton } from "./AxialListOverlayButton.js";

class AxialListOverlay extends AxialOverlayBase
{
    /// vars
    /** @type { Array } */
    #values;

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

    get values() { return this.#values; }
    set values( value )
    {
        
        if( Array.isArray(value) === false ) { throw new TypeError("Array required"); }
        this.#values = value;
        if( this.#group )
        {
            this.#group.clearToggles();
            const l = this.#values.length;
            for( let i = 0; i < l; i++ )
            {
                const t = new AxialDropdownToggle();
                t.text = this.#values[i].label;
                t.data = this.#values[i].value;
                this.#group.appendToggle(t);
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#group = this.shadowRoot.getElementById("group");
        this.#group.forceSelection = true;
        this.#group.addEventListener("indexChanged", this.#boundIndexChangedHandler);

        if( this.#values && this.#group )
        {
            //console.log("should update data")
            const l = this.#values.length;
            for( let i = 0; i < l; i++ )
            {
                const t = new AxialDropdownToggle();
                t.text = this.#values[i].label;
                t.data = this.#values[i].value;
                this.#group.appendToggle(t);
            }
        }
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
