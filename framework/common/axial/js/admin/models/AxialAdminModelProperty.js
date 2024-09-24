"use strict"

import { AxialComponentBase } from "../../core/AxialComponentBase.js";
import { AxialDropdownList } from "../../dropdown/AxialDropdownList.js";
import { AxialToggleCheck } from "../../button/AxialToggleCheck.js";
import { AxialDropdownCalendar } from "../../dropdown/AxialDropdownCalendar.js";
import { AxialButton } from "../../button/AxialButton.js";

class AxialAdminModelProperty extends AxialComponentBase
{
    /// vars

    /** @type { String } */
    #mode = "new";

    /** @type { Set.<String> } */
    #MODES = new Set([ "new", "from"] );

    /** @type { String } */
    #propertyName = "";

    /** @type { String } */
    #propertyType = "";

    /** @type { any } */
    #propertyValue;

    /** @type { Boolean } */
    #propertyCrypted = false;

    /** @type { Array.<String> } */
    #propertyList = new Array();

    /** @type { Boolean } */
    #isValidProperty = false;

    /** @type { Set.<String> } */
    #PROPERTY_TYPES = new Set( [ "string", "number", "boolean", "image", "date", "color", "email", "tel", "list" ] );

    /// elements
    /** @type { HTMLInputElement } */
    #nameInput;

    /** @type { HTMLInputElement } */
    #valueInput;

    /** @type { HTMLSelectElement } */
    #selectInput;

    /** @type { AxialToggleCheck } */
    #cryptedInput;

    /** @type { AxialDropdownList } */
    #dropdown;

    /** @type { HTMLElement} */
    #fileSelector;

    /** @type { AxialButton } */
    #fileButton;

    /** @type { HTMLElement } */
    #fileViewer;

    /// events
    /** @type { Function } */
    #boundNameInputChanged;

    /** @type { Function } */
    #boundValueInputChanged;

    /** @type { Function } */
    #boundSelectInputChanged;
    
    /** @type { Function } */
    #boundDropdownValueChangedHandler;

    /** @type { Function } */
    #boundCryptedToggleChangedHandler;

    /** @type { Function } */
    #boundFileButtonClickHandler;
    
    constructor( mode = "new" )
    {
        super();
        if( this.#MODES.has(mode) === false )
        {
            throw new Error("Wrong value : value must be 'new' or 'from'");
        }
        this.#mode = mode;
        this.classList.add("axial_admin_model_property");
        this.template = "axial-admin-model-property-template";

        this.#boundNameInputChanged = this.#nameInputChangedHandler.bind(this);
        this.#boundValueInputChanged = this.#valueInputChangedHandler.bind(this);
        this.#boundSelectInputChanged = this.#selectInputChangedHandler.bind(this);

        this.#boundDropdownValueChangedHandler = this.#dropdownValueChangedHandler.bind(this);
        this.#boundCryptedToggleChangedHandler = this.#cryptedToggleChangedHandler.bind(this);

        this.#boundFileButtonClickHandler = this.#fileButtonClickHandler.bind(this);
    }

    /** @readonly */
    get isValid()
    {
        let valid = false;
        if( this.#mode === "new" )
        {
            //console.log("check new");
            //console.log( this.#nameInput.validity.valid );
            //console.log(this.#dropdown.value);

            if( this.#nameInput.validity.valid === true && this.#dropdown.value !== "" )
            {
                valid = true;
            }
        }
        else if( this.#mode === "from" )
        {
            if( this.#propertyType === "list" && this.#selectInput.value !== "" )
            {
                valid = true
            }
            else
            {
                valid = this.#valueInput.validity.valid;
            }
        }
        return valid;
    }

    /**
     * @type { String }
     * @readonly
     */
    get propertyName()
    {
        return this.#nameInput.value;
    }

    /** @readonly */
    get propertyType()
    {
        return this.#dropdown.value;
    }

    /** @readonly */
    get propertyCrypted()
    {
        return this.#cryptedInput.selected;
    }

    /** @readonly */
    get propertyValue()
    {
        let valueToReturn = "";
        if( this.#propertyType && this.#propertyType === "list" )
        {
            valueToReturn = this.#selectInput.value;
        }
        else
        {
            valueToReturn = this.#valueInput.value;
        }
        return valueToReturn;
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#nameInput = this.shadowRoot.getElementById("nameInput");
        if( this.#nameInput )
        {
            this.#nameInput.addEventListener("change", this.#boundNameInputChanged);
        }

        this.#valueInput = this.shadowRoot.getElementById("valueInput");
        if( this.#valueInput )
        {
            if( this.#mode === "new" )
            {
                this.#valueInput.remove();
            }
            else
            {
                this.#valueInput.addEventListener("change", this.#boundValueInputChanged);
            }
        }
        
        this.#selectInput = this.shadowRoot.getElementById("selectInput");
        if( this.#selectInput )
        {
            this.#selectInput.addEventListener("change", this.#boundSelectInputChanged);
        }

        this.#cryptedInput = this.shadowRoot.getElementById("cryptedInput");
        if( this.#cryptedInput )
        {
            this.#cryptedInput.addEventListener("toggleChanged", this.#boundCryptedToggleChangedHandler);
        }

        this.#dropdown = this.shadowRoot.getElementById("dropdown");
        if( this.#dropdown )
        {
            this.#dropdown.values = Array.from(this.#PROPERTY_TYPES);
            this.#dropdown.addEventListener("valueChanged", this.#boundDropdownValueChangedHandler);
        }

        this.#fileSelector = this.shadowRoot.getElementById("fileSelector");

        this.#fileButton = this.shadowRoot.getElementById("fileButton");
        console.log(this.#fileButton);
        if( this.#fileButton )
        {
            this.#fileButton.addEventListener("click", this.#boundFileButtonClickHandler);
        }


        this.#fileViewer = this.shadowRoot.getElementById("fileViewer");

    }

    #nameInputChangedHandler( event )
    {
        this.#dispatchChanged();
    }

    #valueInputChangedHandler( event )
    {
        this.#dispatchChanged();
    }

    #selectInputChangedHandler( event )
    {
        console.log(this.#selectInput.value);
        this.#dispatchChanged();
    }

    #dropdownValueChangedHandler( event )
    {
        // a priori pas besoin, je garde par sécu
        /*
        if( this.#dropdown.value === "list" )
        {
            if( this.#valueInput ) { this.#valueInput.style.display = "none"; }
            if( this.#selectInput ) { this.#selectInput.style.display = "block"; }
        }
        else
        {
            if( this.#valueInput ) { this.#valueInput.style.display = "block"; }
            if( this.#selectInput ) { this.#selectInput.style.display = "none"; }
        }
        */
        this.#dispatchChanged();
    }

    #cryptedToggleChangedHandler( event )
    {
        this.#dispatchChanged();
    }

    #fileButtonClickHandler( event )
    {
        console.log("show selector");
        const selector = document.getElementById("selector");
        console.log(selector);
        if( selector )
        {
            selector.show();
        }
    }

    #dispatchChanged()
    {
        const modelPropertyEvent = new CustomEvent("modelPropertyChanged", { detail: { mode: this.#mode, value: this.#valueInput.value } } );
        this.dispatchEvent( modelPropertyEvent );
    }

    _onDataChanged()
    {
        console.log( this.data );
        if( this.#mode === "from" )
        {
            this.#propertyName = this.data[0];
            this.#propertyType = this.data[1].type;
            this.#propertyCrypted = this.data[1].crypted;

            if( this.#cryptedInput )
            {
                this.#cryptedInput.selected = this.#propertyCrypted;
            }

            //console.log(this.#propertyType);

            if( this.#propertyType === undefined || this.#propertyType === null || this.#PROPERTY_TYPES.has( this.#propertyType ) === false )
            {
                throw new Error("IMPORTANT : propertyType wrong value");
            }

            if( this.#propertyType === "list" )
            {
                if( this.#valueInput ) { this.#valueInput.style.display = "none"; }
                if( this.#selectInput ) { this.#selectInput.style.display = "block"; }

                this.#propertyList = this.data[1].list;
                console.log(this.#propertyList);
                for( const str of this.#propertyList )
                {
                    const opt = document.createElement("option");
                    opt.value = str;
                    opt.innerHTML = str;

                    if( this.#selectInput )
                    {
                        this.#selectInput.add(opt);
                    }
                }
            }

            if( this.#nameInput )
            {
                this.#nameInput.value = this.#propertyName;
                this.#nameInput.setAttribute("disabled", "");
            }

            if( this.#dropdown )
            {
                this.#dropdown.value = this.#propertyType;
                this.#dropdown.enabled = false;
            }
            
            if( this.#cryptedInput )
            {
                this.#cryptedInput.enabled = false;
            }

            if( this.#valueInput )
            {
                switch( this.#propertyType )
                {
                    case "email":
                        this.#valueInput.setAttribute("type", "email");
                    break;

                    case "tel":
                        this.#valueInput.setAttribute("type", "tel");
                    break;

                    case "color":
                        this.#valueInput.setAttribute("type", "color");
                    break;

                    case "date":
                        this.#valueInput.setAttribute("type", "date");
                    break;

                    case "image":
                        this.#valueInput.setAttribute("type", "file");
                    break;
                
                    default:
                    break;
                }
                
            }
        }
    }

}
window.customElements.define("axial-admin-model-form-property", AxialAdminModelProperty);
export { AxialAdminModelProperty }