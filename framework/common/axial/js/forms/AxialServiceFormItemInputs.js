"use strict";

import { AxialServiceFormItem } from "./AxialServiceFormItem.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";

class AxialServiceFormItemInputs extends AxialServiceFormItem
{
    /// vars
    /** @type { Array<HTMLInputElement> } */
    #inputs = new Array();

    /** @type { HTMLSlotElement} */
    #contentSlot;

    /// events
    /** @type { Function } */
    #boundFocusOutHandler;
    
    constructor()
    {
        super();
        //this.classList.add("axial_service_form_item");
        //this.template = "axial-service-form-item-template";
        this.#boundFocusOutHandler = this.#focusOutHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-label", "axial-field", "axial-direction" ];
    }

    get inputs() { return this.#inputs; }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#contentSlot = this.shadowRoot.getElementById("contentSlot");
        if( this.#contentSlot )
        {
            const elements = this.#contentSlot.assignedElements();
            //console.log(elements);
            for( const element of elements )
            {
                if( element instanceof HTMLInputElement === true || element instanceof HTMLTextAreaElement === true )
                {
                    element.addEventListener("focusout", this.#boundFocusOutHandler);
                    element.value = ""; // hack the browser
                    this.#inputs.push( element );
                }
                else
                {
                    const possibleInputs = element.getElementsByTagName("input");
                    for( const possibleInput of possibleInputs )
                    {
                        possibleInput.addEventListener("focusout", this.#boundFocusOutHandler);
                        possibleInput.value = ""; // hack the browser
                        this.#inputs.push( possibleInput );
                    }
                }
            }
        }
    }

    _checkValidity()
    {
        let finalValid = true;
        for( const input of this.#inputs )
        {
            if( input.validity.valid === false )
            {
                finalValid = false;
                break;
            }
        }
        return finalValid;       
    }

    _getItemAsObject()
    {
        let itemObject = {};

        itemObject.field = this.field;
        //itemObject.inputs = new Array();
        itemObject.value = new Array();

        for( const input of this.#inputs )
        {
            //itemObject.inputs.push( { name: input.name, value: input.value } );
            const inputValue =  input.type === "number" ? input.valueAsNumber : input.value;
            itemObject.value.push( { field: input.name, value: inputValue } );
        }

        return itemObject;
    }

    #focusOutHandler( event )
    {
        console.log("focus out");
        const formItemEvent = new CustomEvent("itemValidityChanged", { bubbles: true } );
        this.dispatchEvent( formItemEvent );
    }

    #fillItem( object )
    {
        /*
        if( object === undefined )
        {
            return; // KEEP TO TRACK ERRORS
        }
        */
        //console.log("#fill item inputs");
        //console.log(object);

        for( const input of this.#inputs )
        {
            const name = input.name;
            const value = object[name];
            if( value )
            {
                input.value = value;
            }
        }

        /*
        if( typeof object === "string" )
        {
            if( this.#inputs && this.#inputs[0] )
            {
                this.#inputs[0].value = object;
            }
        }
        else
        {
            console.log("SUPER IMPORTANT", object); // possible problems with array
            for( const input of this.#inputs )
            {
                
                const kvo = ObjectUtils.getObjectByField( object, "name", input.name );
                if( kvo && kvo.value )
                {
                    input.value = kvo.value;
                }
                
            }
        }
        */
    }

    _fillItem( object )
    {
        this.#fillItem( object );
    }

    _clearItem()
    {
        for( const input of this.#inputs )
        {
            input.value = ""; // check type of input
        }
    }
}

window.customElements.define("axial-service-form-item-inputs", AxialServiceFormItemInputs);
export { AxialServiceFormItemInputs }