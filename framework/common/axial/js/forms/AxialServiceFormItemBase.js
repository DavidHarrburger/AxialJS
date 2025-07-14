"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialServiceFormItemBase extends AxialComponentBase
{

    /** @type { RegExp } */
    #fieldReg = /^[_A-Za-z0-9]+$/;

    /** @type { String } */
    #field;

    /** @type { Object } */
    #value;

    /** @type { Boolean } */
    #enabled = false;

    /** @type { Boolean } */
    #editable = true;

    constructor()
    {
        super();
    }

    static get observedAttributes()
    {
        return ["axial-field"];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        //console.log("AxialServiceFormItemBase");
        //console.log( name, newValue);
        if( name === "axial-field" )
        {
            this.field = newValue;
        }
    }

    /**
     * @readonly
     */
    get isValid()
    {
        return this.#checkValidity();
    }

    get field() { return this.#field }
    set field( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        
        const validValue = this.#checkField(value);
        if( validValue === true )
        {
            this.#field = value;
        }
    }

    get value() { return this.#value }
    set value( value )
    {
        // checker ?
        this.#value = value;
    }

    get enabled() { return this.#enabled; }
    set enabled( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( value !== this.#enabled )
        {
            this.#enabled = value;
            this._setEnabled();
        }
    }

    get editable() { return this.#editable; }
    set editable( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( value !== this.#editable )
        {
            this.#editable = value;
            this._setEditable();
        }
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    /**
     * @abstract
     * A convenience method called each time the setter changed. Use is to adapt the UI regarding your scenario.
     */
    _setEnabled() {}

    /**
     * @abstract
     */
    _setEditable() {}

    /**
     * 
     * @returns { Boolean }
     */
    #checkValidity()
    {
        const validity = this._checkValidity() || false;
        return validity;
    }

    /**
     * @abstract
     */
    _checkValidity() {}

    /**
     * @abstract
     * @returns { Object }
     * Return an object that is the mirror of your item.
     * It is used by the parent AxialServiceForm to populate the body of the POST request.
     */
    _getItemAsObject()
    {
        let itemObject = {};
        itemObject.field = this.#field;
        itemObject.value = this.#value;
        return itemObject;
    }

    /**
     * @abstract
     * @param { Object } object 
     */
    _fillItem( object ) {}


    /**
     * @abstract
     */
    _clearItem() {}

    #checkField( value )
    {
        const validField = this.#fieldReg.test(value);
        if( validField === false )
        {
            throw new TypeError("Only A-Z, a-z and _ char accepted");
        }
        return true;
    }

}

window.customElements.define("axial-service-form-item-base", AxialServiceFormItemBase);
export { AxialServiceFormItemBase }