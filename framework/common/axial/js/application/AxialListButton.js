"use strict";

import { AxialButton } from "../button/AxialButton.js";
import { AxialToggleButtonGroupBase } from "../button/AxialToggleButtonGroupBase.js";
import { AxialDropdownToggle } from "../dropdown/AxialDropdownToggle.js";
import { AxialListOverlay } from "../overlay/AxialListOverlay.js";


class AxialListButton extends AxialButton
{
    /// vars
    /** @type { Array } */
    #values;

    /// elements
    /** @type { AxialListOverlay } */
    #listOverlay;

    /// events
    /** @type { Function } */
    #boundListChangedHandler;

    constructor()
    {
        super();
        this.#boundListChangedHandler = this.#listChangedHandler.bind(this);
    }

    /**
     * @type { AxialListOverlay }
     * @readonly
     */
    get overlay() { return this.#listOverlay; }

    /**
     * @type { AxialToggleButtonGroupBase }
     * @readonly
     */
    get group() { return this.#listOverlay.group; }

    get selectedIndex() { return this.group.selectedIndex; }
    set selectedIndex( value ) 
    {
        if( isNaN(value) == true )
        {
            throw new TypeError( "Number value expected" );
        }

        if( this.group === undefined ) { return; }
        this.group.selectedIndex = value;
        this.text = this.#values[value].label;
    }

    get values() { return this.#values; }
    set values( value )
    {
        if( Array.isArray(value) === false ) { throw new TypeError("Array required"); }
        this.#values = value;
        if( this.#listOverlay && this.#listOverlay.group )
        {
            const g = this.#listOverlay.group;
            g.clearToggles();
            const l = this.#values.length;
            for( let i = 0; i < l; i++ )
            {
                const t = new AxialDropdownToggle();
                t.text = this.#values[i].label;
                t.data = this.#values[i].value;
                g.appendToggle(t);
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#listOverlay = new AxialListOverlay();
        this.#listOverlay.target = this;
        this.#listOverlay.addEventListener("listChanged", this.#boundListChangedHandler);
    }

    #listChangedHandler( event )
    {
        const d = event.detail;
        this.text = d.label;
        const listEvent = new CustomEvent("listChanged", { bubbles: true, detail: d } );
        this.dispatchEvent(listEvent);
    }

}

window.customElements.define("axial-list-button", AxialListButton);
export { AxialListButton }
