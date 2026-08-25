"use strict";

import { AxialWeekPlanning } from "../date/AxialWeekPlanning.js";
import { AxialFormItem } from "./AxialFormItem.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";

class AxialFormItemWeekPlanning extends AxialFormItem
{
    /** @type { AxialWeekPlanning } */
    #weekPlanning;

    /** @type { Function } */
    #boundWeekPlanningChangedHandler;

    constructor()
    {
        super();
        this.template = "axial-form-item-week-planning-template";
        this.#boundWeekPlanningChangedHandler = this.#weekPlanningChanged.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#weekPlanning = this.shadowRoot.getElementById("weekPlanning");
        this.#weekPlanning.addEventListener("weekPlanningChanged", this.#boundWeekPlanningChangedHandler);
    }

    _getItemAsObject()
    {
        let itemObject = {};

        itemObject.field = this.field;
        itemObject.value = this.#weekPlanning.getAsArray();
        return itemObject;
    }

    _checkValidity()
    {
        return true;
    }

    #weekPlanningChanged( event )
    {
        const formItemEvent = new CustomEvent("itemValidityChanged", { bubbles: true } );
        this.dispatchEvent( formItemEvent );
    }
    
    _fillItem( object )
    {
        const value = object[this.field]; // cas du modèle
        if( value )
        {
            this.#weekPlanning.setFromArray( value );
        }
        else
        {
            const fillObject = ObjectUtils.getObjectByField( object, "field", this.field );
            if( fillObject )
            {
                this.#weekPlanning.setFromArray( fillObject.value );
            }
        }
    }
}
window.customElements.define("axial-form-item-week-planning", AxialFormItemWeekPlanning);
export { AxialFormItemWeekPlanning }