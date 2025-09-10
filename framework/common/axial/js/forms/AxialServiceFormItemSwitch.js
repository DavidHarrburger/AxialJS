"use strict";

import { AxialServiceFormItem } from "./AxialServiceFormItem.js";
import { AxialToggleSwitch } from "../button/AxialToggleSwitch.js";

class AxialServiceFormItemSwitch extends AxialServiceFormItem
{
    /// elements
    /** @type { AxialToggleSwitch } */
    #switch;

    /// events
    /** @type { Function } */
    #boundSwitchHandler;
    
    constructor()
    {
        super();
        this.template = "axial-service-form-item-switch-template";
        this.#boundSwitchHandler = this.#switchHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-label", "axial-field", "axial-direction" ];
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#switch = this.shadowRoot.getElementById("switch");
        if( this.#switch )
        {
            this.#switch.addEventListener("toggleChanged", this.#boundSwitchHandler);
        }
    }

    _checkValidity()
    {
        return true;
    }

    _getItemAsObject()
    {
        let itemObject = {};
        itemObject.field = this.field;
        itemObject.value = this.#switch.selected;
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

    #switchHandler( event )
    {
        const formItemEvent = new CustomEvent("itemValidityChanged", { bubbles: true } );
        this.dispatchEvent( formItemEvent );
    }
}

window.customElements.define("axial-service-form-item-switch", AxialServiceFormItemSwitch);
export { AxialServiceFormItemSwitch }