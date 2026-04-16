"use strict";

import { AxialToggleButtonGroupBase } from "../button/AxialToggleButtonGroupBase.js";
import { AxialDropdown } from "./AxialDropdown.js";
import { AxialDropdownToggle } from "./AxialDropdownToggle.js";
import { DomUtils } from "../utils/DomUtils.js";

class AxialDropdownList extends AxialDropdown
{
    /// vars
    /** @type { String } */
    #value = "";

    /** @type { Array.<Object> } */
    #values;

    /// elements
    /** @type { AxialToggleButtonGroupBase} */
    #group;

    /// events
    /** @type { Function } */
    #boundIndexChangedHandler;
    

    constructor()
    {
        super();
        this.template = "axial-dropdown-list-template";
        this.#boundIndexChangedHandler = this.#indexChangedHandler.bind(this);
    }

    get value() { return this.#value; }
    set value( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        if( value === "" )
        {
            console.warn("CHECK DROPDOWN LIST");

        }
        
        for( const kv of this.#values )
        {
            if( value === kv.value || value === kv.label )
            {
                this.#value = kv.value;
                this.text = kv.label;
                break;
            }
        }
    }

    /**
     * @type { Array.<String> }
     */
    get values() { return this.#values; }
    set values( value )
    {
        this.#values = value;
        if( this.#group )
        {
            this.#group.clearToggles();
            for( const s of this.#values )
            {
                const dropdownToggle = new AxialDropdownToggle();
                dropdownToggle.text = s.label;
                // update value
                this.#group.appendToggle(dropdownToggle);
            }       
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#group = this.shadowRoot.getElementById("group");
        this.#group.forceSelection = true;
        this.#group.addEventListener("indexChanged", this.#boundIndexChangedHandler);
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-text" )
        {
            //console.log("TEST DROPDOWN");
        }
    }

    /**
     * 
     * @param { AxialDropdownToggle } item 
     */
    addDropdownToggle( item )
    {
        if( this.#group )
        {
            this.#group.appendToggle( item );
        }
    }

    /** @type { CustomEvent } */
    #indexChangedHandler( event )
    {
        const toggle = this.#group.getSelectedToggle();
        if( toggle )
        {
            const index = this.#group.toggles.indexOf(toggle);
            this.text = this.#values[index].label;
            this.#value = this.#values[index].value;
            const valueChangedEvent = new CustomEvent("valueChanged", { detail: { newValue: this.#value } } );
            this.dispatchEvent(valueChangedEvent);
        }
        this.close();
    }
}

window.customElements.define("axial-dropdown-list", AxialDropdownList);
export { AxialDropdownList }