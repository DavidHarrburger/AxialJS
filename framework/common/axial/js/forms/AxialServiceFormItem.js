"use strict";

import { AxialServiceFormItemBase } from "./AxialServiceFormItemBase.js";

class AxialServiceFormItem extends AxialServiceFormItemBase
{
    /// vars
    /** @type { String } */
    #labelText = "";

    /** @type { Boolean } */
    #isRequired = false;

    /** @type { String } */
    #requiredChar = " *";

    /// styles
    /** @type { Set<String> } */
    #DIRECTIONS = new Set( [ "column", "row" ] );

    /** @type { String } */
    #direction = "column";

    /// elements
    /** @type { HTMLElement } */
    #label;

    /** @type { HTMLElement } */
    #content;

    /** @type { HTMLElement } */
    #info;

    /** @type { HTMLSlotElement } */
    #infoSlot;
    
    constructor()
    {
        super();
        this.classList.add("axial_service_form_item");
        this.template = "axial-service-form-item-template";
    }

    static get observedAttributes()
    {
        return [ "axial-label", "axial-direction", "axial-field", "axial-required" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-label" )
        {
            this.#labelText = newValue;
            if( this.#label )
            {
                this.#label.innerHTML = this.#labelText;
            }
        }

        if( name === "axial-direction" )
        {
            const tempDirection = this.#DIRECTIONS.has(newValue) === false ? "column" : newValue;
            this.#direction = tempDirection;
            if( this.#content )
            {
                this.#content.style.flexDirection = this.#direction;
            }
        }

        if( name === "axial-required" )
        {
            this.#isRequired = true;
            if( this.#label && this.#labelText )
            {
                this.#label.innerHTML = this.#labelText + this.#requiredChar;
            }
        }
    }

    get labelText() { return this.#labelText; }

    _buildComponent()
    {
        super._buildComponent();
        
        /// vars
        this.#labelText = this.getAttribute("axial-label") || "";
        this.#isRequired = this.getAttribute("axial-required") !== null ? true : false;
        const tempDirection = this.getAttribute("axial-direction") || "column";
        if( this.#DIRECTIONS.has(tempDirection) === true && tempDirection != this.#direction )
        {
            this.#direction = tempDirection;
        }

        this.#label = this.shadowRoot.getElementById("label");
        if( this.#label )
        {
            this.#label.innerHTML = this.#isRequired === true ? this.#labelText + this.#requiredChar : this.#labelText;
        }

        this.#content = this.shadowRoot.getElementById("content");
        if( this.#content )
        {
            this.#content.style.flexDirection = this.#direction;
        }

        this.#info = this.shadowRoot.getElementById("info");
        this.#infoSlot = this.shadowRoot.getElementById("infoSlot");
        if( this.#info )
        {
            if( this.#infoSlot )
            {
                const infoElements = this.#infoSlot.assignedElements();
                if( infoElements.length === 0 )
                {
                    this.#info.style.display = "none";
                }
            }
            else
            {
                this.#info.style.display = "none";
            }
        }
    }

    _getItemAsObject()
    {
        let itemObject = {};

        //itemObject.label = this.labelText;
        itemObject.field = this.field;
        itemObject.value = this.value;

        return itemObject;
    }

}

window.customElements.define("axial-service-form-item", AxialServiceFormItem);
export { AxialServiceFormItem }