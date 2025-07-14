"use strict";

import { AxialServiceFormItem } from "./AxialServiceFormItem.js";
import { AxialToggleRadio } from "../button/AxialToggleRadio.js";
import { AxialToggleButtonGroup } from "../button/AxialToggleButtonGroup.js";

class AxialServiceFormItemToggles extends AxialServiceFormItem
{
    /// elements
    /** @type { AxialToggleButtonGroup } */
    #toggles;

    /// events
    /** @type { Function } */
    #boundIndexChangedHandler;
    
    constructor()
    {
        super();
        this.template = "axial-service-form-item-toggles-template";
        this.#boundIndexChangedHandler = this.#indexChangedHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-label", "axial-field", "axial-direction" ];
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#toggles = this.shadowRoot.getElementById("toggles");
        if( this.#toggles )
        {
            this.#toggles.forceSelection = true;
            this.#toggles.addEventListener("indexChangedHandler", this.#boundIndexChangedHandler);
        }
    }

    _checkValidity()
    {
        const finalValid = this.#toggles.selectedIndex != -1;
        return finalValid;       
    }

    _getItemAsObject()
    {
        let itemObject = {};
        itemObject.field = this.field;

        const toggle = this.#toggles.getSelectedToggle();
        if( toggle instanceof AxialToggleRadio )
        {
            itemObject.value = toggle.value;
        }

        console.log( "toggle object", itemObject);
        return itemObject;
    }

    #fillItem( object )
    {
        /// TODO
    }

    _fillItem( object )
    {
        this.#fillItem( object );
    }

    _clearItem()
    {
        /// TODO
    }

    #indexChangedHandler( event )
    {
        const formItemEvent = new CustomEvent("itemValidityChanged", { bubbles: true } );
        this.dispatchEvent( formItemEvent );
    }
}

window.customElements.define("axial-service-form-item-toggles", AxialServiceFormItemToggles);
export { AxialServiceFormItemToggles }