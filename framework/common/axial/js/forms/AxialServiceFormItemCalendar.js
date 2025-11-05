"use strict";

import { AxialCalendarButton } from "../date/AxialCalendarButton.js"; 
import { AxialServiceFormItem } from "./AxialServiceFormItem.js";

class AxialServiceFormItemCalendar extends AxialServiceFormItem
{
    /** @type { AxialCalendarButton } */
    #calendarButton;

    /** @type { Function } */
    #boundDateChangedHandler;

    constructor()
    {
        super();
        this.template = "axial-service-form-item-calendar-template";
        this.#boundDateChangedHandler = this.#dateChangedHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#calendarButton = this.shadowRoot.getElementById("calendarButton");
        this.#calendarButton.addEventListener("dateChanged", this.#boundDateChangedHandler);
    }

    _getItemAsObject()
    {
        let itemObject = {};

        itemObject.field = this.field;
        itemObject.value = this.#calendarButton.date;
        return itemObject;
    }

    _checkValidity()
    {
        return true;
    }

    #dateChangedHandler( event )
    {
        const formItemEvent = new CustomEvent("itemValidityChanged", { bubbles: true } );
        this.dispatchEvent( formItemEvent );
    }
    
    _fillItem( object )
    {
        console.log(object);
        if( object && object[this.field] )
        {
            this.#calendarButton.date = new Date( object[this.field] );
        }
    }

    _clearItem()
    {
        this.#calendarButton.text = "Sélectionner une date";
        this.#calendarButton.calendar.unselect();
    }
}
window.customElements.define("axial-service-form-item-calendar", AxialServiceFormItemCalendar);
export { AxialServiceFormItemCalendar }