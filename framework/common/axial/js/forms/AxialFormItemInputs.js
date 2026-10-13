"use strict";

import { AxialFormItem } from "./AxialFormItem.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";

class AxialFormItemInputs extends AxialFormItem
{
    /// vars
    /** @type { Array.< HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement > } */
    #inputs = new Array();

    /** @type { HTMLSlotElement } */
    #contentSlot;

    /// events
    /** @type { Function } */
    #boundFocusOutHandler;
    
    constructor()
    {
        super();
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
                if( element instanceof HTMLInputElement === true
                    || element instanceof HTMLTextAreaElement === true
                    || element instanceof HTMLSelectElement === true )
                {
                    element.addEventListener("focusout", this.#boundFocusOutHandler);
                    //element.value = ""; // hack the browser
                    this.#inputs.push( element );
                }
                else
                {
                    
                    const inputs = Array.from( element.getElementsByTagName("input") );
                    const areas = Array.from( element.getElementsByTagName("textarea") );
                    const selects = Array.from( element.getElementsByTagName("select") );

                    const possibleInputs = new Array().concat(inputs).concat(areas).concat(selects);
                    // BUGGY HERE -> miss the textarea and select elements
                    for( const possibleInput of possibleInputs )
                    {
                        possibleInput.addEventListener("focusout", this.#boundFocusOutHandler);
                        //possibleInput.value = ""; // hack the browser
                        this.#inputs.push( possibleInput );
                    }
                }
            }
            //console.log(this.#inputs);
        }
    }

    _checkValidity()
    {
        let finalValid = true;
        for( const input of this.#inputs )
        {
            //console.log(input);
            //console.log(input.validity.valid);
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
        itemObject.value = new Array();

        for( const input of this.#inputs )
        {
            const inputValue =  input.type === "number" ? input.valueAsNumber : input.value;
            itemObject.value.push( { field: input.name, value: inputValue } );
        }
        return itemObject;
    }

    #focusOutHandler( event )
    {
        const formItemEvent = new CustomEvent("itemValidityChanged", { bubbles: true } );
        this.dispatchEvent( formItemEvent );
    }

    /**
     * 
     * @param { Object } object 
     */
    #fillItem( object )
    {
        for( const input of this.#inputs )
        {
            const name = input.name;
            const value = object[name]; // cas du modèle
            if( value )
            {
                input.value = value;
            }
            else
            {
                const fillObject = ObjectUtils.getObjectByField( object, "field", name);
                if( fillObject )
                {
                    input.value = fillObject.value;
                }
            }
        }
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

window.customElements.define("axial-form-item-inputs", AxialFormItemInputs);
export { AxialFormItemInputs }