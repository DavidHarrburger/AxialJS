"use strict";

import { AxialDropdownList } from "../../dropdown/AxialDropdownList.js";
import { AxialDropdownToggle } from "../../dropdown/AxialDropdownToggle.js";
import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";
import { DomUtils } from "../../utils/DomUtils.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialAdminModelProperty } from "./AxialAdminModelProperty.js";

class AxialAdminModelForm extends AxialServiceComponentBase
{
    /// vars
    /** @type { String } */
    #mode = "new";

    /** @type { String } */
    #MODES = new Set( ["new", "from"] );

    /** @type { String } */
    #modelName;

    /** @type { Object } */
    #currentModel = undefined;

    /** @type { Array.<AxialAdminModelProperty> } */
    #modelProperties = new Array();

    /// elements
    /** @type { HTMLInputElement } */
    #name;

    /** @type {AxialDropdownList } */
    #dropdown;

    /** @type { HTMLElement } */
    #properties;

    /** @type { AxialServiceButton } */
    #postButton;

    /** @type { AxialButton } */
    #addButton;

    /// events
    /** @type { Function } */
    #boundInputChangedHandler;

    /** @type { Function } */
    #boundDropdownValueChangedHandler;

    /** @type { Function } */
    #boundPostButtonClickHandler;

    /** @type { Function } */
    #boundAddButtonClickHandler;

    /** @type { Function } */
    #boundServiceSuccessHandler;

    /** @type { Function } */
    #boundServiceErrorHandler;

    /** @type { Function } */
    #boundModelPropertyChangedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_admin_form_base");
        this.template = "axial-admin-model-form-template";
        
        this.#boundInputChangedHandler = this.#inputChangedHandler.bind(this);
        this.#boundPostButtonClickHandler = this.#postButtonClickHandler.bind(this);
        this.#boundAddButtonClickHandler = this.#addButtonClickHandler.bind(this);
        this.#boundDropdownValueChangedHandler = this.#dropdownValueChangedHandler.bind(this);

        this.#boundServiceSuccessHandler = this.#serviceSuccessHandler.bind(this);
        this.#boundServiceErrorHandler = this.#serviceErrorHandler.bind(this);

        this.#boundModelPropertyChangedHandler = this.#modelPropertyChangedHandler.bind(this);
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    get mode() { return this.#mode; }
    set mode( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        if( this.#MODES.has(value) === false )
        {
            throw new Error("Wrong value : value must be 'new' or 'from'");
        }

        if( this.#mode === value ) { return; } // prevent a stupid re init
        this.#mode = value;

        this.#updateForm();
    }

    get modelName() { return this.#modelName; }
    set modelName( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        if( this.#modelName === value ) { return; }
        this.#modelName = value;
        this.#updateCurrentModel();
        
    }

    #updateCurrentModel()
    {
        console.log("UPDATE CURRENT MODEL IN FORM")
        console.log( this.getData.content.collection );
        const models = this.getData.content.collection;
        this.#currentModel = undefined;
        for( const model of models )
        {
            if( model.name && model.name === this.#modelName )
            {
                this.#currentModel = model;
            }
        }

        if( this.#currentModel === undefined )
        {
            throw new Error("IMPORTANT MODEL WAS NOT FOUND");
        }
        this.#updateForm();
    }

    #updateForm()
    {
        this.#cleanProperties();
        if( this.#mode === "new" )
        {
            this.#name.value = "";
            this.#name.removeAttribute("disabled");

            this.#dropdown.enabled = true;
        }
        else if( this.#mode === "from" )
        {
            // alreday checked just above but just in case I miss something
            if( this.#currentModel !== undefined )
            {
                //console.log(this.#currentModel);
                
                this.#name.value = this.#modelName;
                this.#name.setAttribute("disabled", "");
                
                this.#dropdown.value = this.#currentModel.collection;
                this.#dropdown.enabled = false;

                const props = this.#currentModel.props;
                for( const prop of Object.entries(props) )
                {
                    if( this.#properties )
                    {
                        const modelProperty = new AxialAdminModelProperty(this.#mode);
                        modelProperty.addEventListener("modelPropertyChanged", this.#boundModelPropertyChangedHandler);
                        this.#properties.appendChild( modelProperty );
                        modelProperty.data = prop;
                        this.#modelProperties.push(modelProperty);

                    }
                }
            }
        }
        this.#checkFormValidity();
    }

    #cleanProperties()
    {
        DomUtils.cleanElement(this.#properties);
        this.#modelProperties = new Array();
    }

    #buildComponent()
    {
        this.addEventListener("serviceSuccess", this.#boundServiceSuccessHandler);
        this.addEventListener("serviceError", this.#boundServiceErrorHandler);

        this.#name = this.shadowRoot.getElementById("name");
        if( this.#name )
        {
            this.#name.addEventListener("input", this.#boundInputChangedHandler);
        }

        this.#dropdown = this.shadowRoot.getElementById("dropdown");
        if( this.#dropdown )
        {
            this.#dropdown.addEventListener("valueChanged", this.#boundDropdownValueChangedHandler);
        }

        this.#properties = this.shadowRoot.getElementById("properties");
        
        this.#addButton = this.shadowRoot.getElementById("addButton");
        if( this.#addButton )
        {
            this.#addButton.addEventListener("click", this.#boundAddButtonClickHandler);
        }

        this.#postButton = this.shadowRoot.getElementById("postButton");
        if( this.#postButton )
        {
            this.#postButton.addEventListener("click", this.#boundPostButtonClickHandler);
        }
        this.initialize();
    }

    initialize()
    {
        super.initialize();
        this.#postButton.enabled = false;
        this.#name.setAttribute( "disabled", "" );
        this.loadGetData();
    }

    _prepareGetData()
    {
        return this.getPath;
    }

    _preparePostData()
    {
        let document =
        {
            mode: this.#mode
        };

        if( this.#mode === "new" )
        {
            let objectNew = {};
            objectNew.name = this.#name.value;
            objectNew.collection = this.#dropdown.value;
            objectNew.props = {};

            for( const mp of this.#modelProperties )
            {
                objectNew.props[mp.propertyName] = { type: mp.propertyType, crypted: mp.propertyCrypted };
            }
            document.object = objectNew;
            document.collection = "models"; // bis repetita w/ server side
        }
        else if ( this.#mode === "from" )
        {
            let objectFrom = {};
            objectFrom.model = this.#name.value;
            for( const mp of this.#modelProperties )
            {
                objectFrom[mp.propertyName] = mp.propertyValue;
            }
            document.object = objectFrom;
            document.collection  = this.#dropdown.value;
        }
        
        console.log( document );
        return document;
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #serviceSuccessHandler( event )
    {
        const method = event.detail.method;
        if( method == "get" )
        {
            this.#name.removeAttribute( "disabled" );
            console.log(this.getData);

            const collectionNames = this.getData.content.all;

            if( this.#dropdown )
            {
                this.#dropdown.values = collectionNames;
            }
        }
        else if( method == "post" )
        {
            this.#name.value = "" ;
            this.#postButton.loading = false;
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #serviceErrorHandler( event )
    {

    }

    /**
     * Check if the new name of the database already exists
     * @returns { Boolean }
     */
    #checkNameValidity()
    {
        let exists = false;
        const value = this.#name.value;
        for( const model of this.getData.content )
        {
            if( model.name == value )
            {
                exists = true;
            }
        }
        return exists;
    }

    /**
     * 
     * @returns { Boolean }
     */
    #checkFormValidity()
    {
        let formValid = false;

        if( this.#mode === "new" )
        {
            let propertiesNewValid = true;
            if( this.#name.validity.valid && this.#dropdown.value !== "" )
            {
                propertiesNewValid = true;
            }

            if( this.#dropdown.value === "" )
            {
                propertiesNewValid = false;
            }

            if( this.#modelProperties.length === 0 )
            {
                propertiesNewValid = false;
            }

            for( const mp of this.#modelProperties )
            {
                if( mp.isValid == false )
                {
                    propertiesNewValid = false;
                    break;
                }
            }
            formValid = propertiesNewValid;
        }
        else if( this.#mode === "from" )
        {
            let propertiesFromValid = true;
            for( const mp of this.#modelProperties )
            {
                if( mp.isValid == false )
                {
                    propertiesFromValid = false;
                    break;
                }
            }
            formValid = propertiesFromValid;
        }

        
        if( formValid === true )
        {
            this.#postButton.enabled = true;
        }
        else
        {
            this.#postButton.enabled = false;
        }
        
        return formValid;
    }

    #inputChangedHandler( event )
    {
        this.#checkFormValidity();
        /*
        let valids = this.#name.validity.valid;
        //let exists = this.#checkNameValidity();
        
        //if( valids === true && exists === false )
        if( valids === true )
        {
            this.#button.enabled = true;
        }
        else
        {
            this.#button.enabled = false;
        }
        */
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #dropdownValueChangedHandler( event )
    {
        console.log("collection dropdown value changed");
        this.#checkFormValidity();
    }

    #addButtonClickHandler( event )
    {
        if( this.#properties )
        {
            const modelProperty = new AxialAdminModelProperty();
            modelProperty.addEventListener("modelPropertyChanged", this.#boundModelPropertyChangedHandler);
            this.#properties.appendChild( modelProperty );
            this.#modelProperties.push(modelProperty);
        }
        this.#checkFormValidity()
    }

    #modelPropertyChangedHandler( event )
    {
        this.#checkFormValidity();
    }

    #postButtonClickHandler( event )
    {
        this.#postButton.enabled = false;
        this.#postButton.loading = true;
        this.loadPostData();
    }
}
window.customElements.define("axial-admin-model-form", AxialAdminModelForm);
export { AxialAdminModelForm }