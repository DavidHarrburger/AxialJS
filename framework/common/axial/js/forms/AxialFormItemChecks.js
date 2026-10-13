"use strict";

import { AxialFormItem } from "./AxialFormItem.js";
import { AxialToggleCheck } from "../button/AxialToggleCheck.js";

class AxialFormItemChecks extends AxialFormItem
{
    /// elements
    /** @type { HTMLSlotElement } */
    #contentSlot;

    // vars
    /** @type { Array<AxialToggleCheck} */
    #checks = new Array();

    /// events
    /** @type { Function } */
    #boundCheckHandler;
    
    constructor()
    {
        super();
        this.template = "axial-form-item-checks-template";
        this.#boundCheckHandler = this.#checkHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-label", "axial-field", "axial-direction", "axial-required" ];
    }

    /**
     * @type { AxialToggleButtonGroup }
     * @readonly
     */
    get checks() { return this.#checks; }

    _buildComponent()
    {
        super._buildComponent();
        this.#contentSlot = this.shadowRoot.getElementById("contentSlot");
        if( this.#contentSlot )
        {
            const elements = this.#contentSlot.assignedElements();
            for( const element of elements )
            {
                if( element instanceof AxialToggleCheck === true )
                {
                    element.addEventListener("toggleChanged", this.#boundCheckHandler);
                    this.#checks.push( element );
                }
            }
        }
    }

    _checkValidity()
    {
        super._checkValidity();
        return true;
    }

    _getItemAsObject()
    {
        let itemObject = {};
        itemObject.field = this.field;
        itemObject.value = new Array();

        for( const check of this.#checks )
        {
            const checkField =  check.value;
            const checkSelected = check.selected;
            itemObject.value.push( { field: checkField, value: checkSelected } );
        }

        return itemObject;
    }

    #fillItem( object )
    {
        for( const check of this.#checks )
        {
            const name = check.value;
            const value = object[name]; // cas du modèle
            if( value )
            {
                check.selected = value;
            }
        }
    }

    _fillItem( object )
    {
        this.#fillItem( object );
    }

    _clearItem()
    {
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #checkHandler( event )
    {
        const formItemEvent = new CustomEvent("itemValidityChanged", { bubbles: true } );
        this.dispatchEvent( formItemEvent );
    }
}

window.customElements.define("axial-form-item-checks", AxialFormItemChecks);
export { AxialFormItemChecks }