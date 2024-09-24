"use strict"

import { AxialToggleButtonGroupBase } from "../button/AxialToggleButtonGroupBase.js";
import { AxialDropdown } from "./AxialDropdown.js";
import { AxialDropdownToggle } from "./AxialDropdownToggle.js";
import { DomUtils } from "../utils/DomUtils.js";

class AxialDropdownList extends AxialDropdown
{
    /// vars
    /** @type { String } */
    #value = "";

    /** @type { Array.<String> } */
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
        if( this.#values.includes(value) === false ) { return; }
        this.#value = value;
        this.text = value;
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
                dropdownToggle.text = s;
                this.#group.appendToggle(dropdownToggle);
            }       
        }
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#group = this.shadowRoot.getElementById("group");
        this.#group.forceSelection = true;
        this.#group.addEventListener("indexChanged", this.#boundIndexChangedHandler);
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
        if( toggle && toggle.text )
        {
            this.text = toggle.text;
            this.#value = toggle.text;
            const valueChangedEvent = new CustomEvent("valueChanged", { detail: { newValue: this.#value } } );
            this.dispatchEvent(valueChangedEvent);
        }
        
        this.close();
    }
    
}

window.customElements.define("axial-dropdown-list", AxialDropdownList);
export { AxialDropdownList }