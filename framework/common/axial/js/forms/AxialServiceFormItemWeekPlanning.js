"use strict";

import { AxialWeekPlanning } from "../date/AxialWeekPlanning.js";
import { AxialServiceFormItem } from "./AxialServiceFormItem.js";

class AxialServiceFormItemWeekPlanning extends AxialServiceFormItem
{
    /** @type { AxialWeekPlanning } */
    #weekPlanning;

    /** @type { Function } */
    #boundWeekPlanningChangedHandler;

    constructor()
    {
        super();
        this.template = "axial-service-form-item-week-planning-template";
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
        if( object && object[this.field] && Array.isArray(object[this.field]) )
        {
            this.#weekPlanning.setFromArray( object[this.field] );
        }
    }
}
window.customElements.define("axial-service-form-item-week-planning", AxialServiceFormItemWeekPlanning);
export { AxialServiceFormItemWeekPlanning }