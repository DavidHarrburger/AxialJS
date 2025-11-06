"use strict";

import { AxialButton } from "../button/AxialButton.js";
import { AxialToggleButtonGroupBase } from "../button/AxialToggleButtonGroupBase.js";
import { AxialListOverlay } from "../overlay/AxialListOverlay.js";

class AxialListButton extends AxialButton
{
    /// vars
    /** @type { Object } */
    #selectedValue;

    /** @type { Array } */
    #values;

    /** @type { String } */
    #overlayPosition = "bottom-left";

    /** @type { Boolean } */
    #updateLabel = true;

    /** @type { Boolean } */
    #uncheckOnHidden = false;

    /// elements
    /** @type { AxialListOverlay } */
    #listOverlay;

    /// events
    /** @type { Function } */
    #boundListChangedHandler;

    /** @type { Function } */
    #boundOverlayHiddenHandler;

    constructor()
    {
        super();
        this.#boundListChangedHandler = this.#listChangedHandler.bind(this);
        this.#boundOverlayHiddenHandler = this.#overlayHiddenHandler.bind(this);
    }

    static get observedAttributes()
    {
        return ["axial-text", "axial-icon-position", "axial-theme", "axial-color", "axial-size", "axial-weight", "axial-align", "axial-style", "axial-gap", "axial-overlay-position" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-overlay-position" )
        {
            this.#overlayPosition = newValue;
        }
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

    /**
     * @type { String }
     */
    get selectedValue() { return this.#selectedValue; }
    set selectedValue( value )
    {
        //console.log( this.#values );
        //console.log( value );
        if( this.#values )
        {
            const vl = this.#values.length;
            for( let i = 0; i < vl; i++ )
            {
                const o = this.#values[i];
                if( o.value === value )
                {
                    this.selectedIndex = i;
                    break;
                }
            }
        }

        this.#selectedValue = value;
    }

    get updateLabel() { return this.#updateLabel; }
    set updateLabel( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        this.#updateLabel = value;
    }

    get uncheckOnHidden() { return this.#uncheckOnHidden; }
    set uncheckOnHidden( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        this.#uncheckOnHidden = value;
    }


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
        if( this.#listOverlay )
        {
            this.#listOverlay.values = value;
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#listOverlay = new AxialListOverlay();
        this.#listOverlay.target = this;
        this.#listOverlay.position = this.#overlayPosition;
        this.#listOverlay.addEventListener("listChanged", this.#boundListChangedHandler);
        this.#listOverlay.addEventListener("overlayHidden", this.#boundOverlayHiddenHandler);
        if( this.#values )
        {
            this.#listOverlay.values = this.#values;
        }
    }

    #listChangedHandler( event )
    {
        const d = event.detail;
        
        this.#selectedValue = d.value;

        if( this.#updateLabel === true )
        {
            this.text = d.label;
        }
        const listEvent = new CustomEvent("listChanged", { bubbles: true, detail: d } );
        this.dispatchEvent(listEvent);
    }

    #overlayHiddenHandler( event )
    {
        if( this.#uncheckOnHidden === true )
        {
            this.group.selectedIndex = -1;
        }
    }
}

window.customElements.define("axial-list-button", AxialListButton);
export { AxialListButton }
