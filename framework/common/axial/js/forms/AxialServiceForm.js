"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";
import { AxialServiceButton }  from "../button/AxialServiceButton.js";
import { AxialServiceFormItemBase } from "./AxialServiceFormItemBase.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";
import { StringUtils } from "../utils/StringUtils.js";
import { AxialServiceFormItemImage } from "./AxialServiceFormItemImage.js";

class AxialServiceForm extends AxialServiceComponentBase
{
    /// vars
    /** @type { Array<AxialServiceFormItemBase> } */
    #items = new Array();

    /** @type { String } */
    #name;

    /** @type { String } */
    #collection;

    /** @type { String } */
    #model;

    /** @type { String } */
    #defaults;

    /** @type { Object } */
    #defaultsObject = {};

    /** @type { Boolean } */
    #isValid = false;

    /** @type { Boolean } */
    #enabled = true;

    /** @type { String } */
    #_id;

    /// elements
    /** @type { HTMLSlotElement} */
    #slot;

    /** @type { AxialServiceButton } */
    #postButton;

    /// events
    /** @type { Function } */
    #boundFormValidityChangedHandler;
    
    /** @type { Function } */
    #boundItemValidityChangedHandler;

    /** @type { Function } */
    #boundPostButtonHandler;
    
    constructor()
    {
        super();
        
        this.classList.add("axial_service_form");
        this.template = "axial-service-form-template";

        this.#boundItemValidityChangedHandler = this.#itemValidityChangedHandler.bind(this);
        this.#boundPostButtonHandler = this.#postButtonHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-name", "axial-collection", "axial-model", "axial-defaults" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-name" )
        {
            this.#name = newValue;
        }

        if( name === "axial-collection" )
        {
            this.#collection = newValue;
        }

        if( name === "axial-model" )
        {
            this.#model = newValue;
        }

        if( name === "axial-defaults" )
        {
            this.#defaults = newValue;
            this.#parseDefaults();
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#name = this.getAttribute("axial-name") || "";
        this.#collection = this.getAttribute("axial-collection") || "";
        this.#model = this.getAttribute("axial-model") || "";
        this.#defaults = this.getAttribute("axial-defaults") || "";

        this.#parseDefaults();

        this.#slot = this.shadowRoot.getElementById("slot");
        if( this.#slot )
        {
            const elements = this.#slot.assignedElements();
            //console.log(elements);
            for( const element of elements )
            {
                if( element instanceof AxialServiceFormItemBase )
                {
                    element.addEventListener("itemValidityChanged", this.#boundItemValidityChangedHandler);
                    this.#items.push( element );
                }
            }
            //console.log(this.#items);
        }

        this.#postButton = this.shadowRoot.getElementById("postButton");
        if( this.#postButton )
        {
            this.#postButton.addEventListener("click", this.#boundPostButtonHandler);
            this.#postButton.enabled = false;
        }
    }

    get enabled() { return this.#enabled; }
    set enabled( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#enabled = value;

        for( const item of this.#items )
        {
            item.enabled = this.#enabled;
        }
    }

    #checkValidity()
    {
        //console.log("AxialServiceForm.#checkValidity()");
        const currentValidity = this.#isValid;

        let finalValid = true;
        for( const item of this.#items )
        {
            //console.log( "1", item);
            //console.log( "2", item.isValid);

            if( item.isValid === false )
            {
                finalValid = false;
                break;
            }
        }

        if( currentValidity !== finalValid )
        {
            this.#isValid = finalValid;
        }

        //console.log(this.#isValid);

        if( this.#postButton )
        {
            this.#postButton.enabled = this.#isValid;
        }

        const formEvent = new CustomEvent("formValidityChanged", { bubbles: true, detail: { valid: this.#isValid } } );
        this.dispatchEvent( formEvent );
    }

    #postButtonHandler( event )
    {
        if( this.#postButton )
        {
            this.enabled = false;
            this.#postButton.enabled = false;
            this.#postButton.loading = true;
        }
        this.loadPostData();
    }

    async loadPostData()
    {
        try
        {
            for( const item of this.#items )
            {
                if( item instanceof AxialServiceFormItemImage && item.canUpload === true )
                {
                    await item.upload();
                }
            }
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            console.log("finally", this.postPath);
            super.loadPostData();
        }
    }

    _preparePostData()
    {
        const o = this.getFormAsObject(); // check here
        return o;
    }

    _onPostResponse()
    {
        console.log("_onPostResponse");
        this.clearForm();
        this.enabled = true;
    }

    _onGetResponse()
    {
        // ONLY ONE OBJECT TO CHECK
        let formModel;
        const content = this.getData.content;
        if( content && content.length === 1 )
        {
            formModel = this.getData.content[0];
        }

        console.log(formModel);

        if( formModel )
        {
            this._fillForm( formModel );
        }
        else
        {
            this.clearForm();
        }
    }

    getFormAsObject()
    {
        let formObject = {};

        formObject.name = this.#name;
        formObject.collection = this.#collection;
        formObject.model = this.#model;

        if( this.#defaultsObject )
        {
            for( const prop of Object.keys( this.#defaultsObject ) )
            {
                formObject[prop] = this.#defaultsObject[prop];
            }
        }

        if( this.#_id !== undefined )
        {
            formObject._id = this.#_id;
        }
        formObject.items = new Array();

        for( const item of this.#items )
        {
            formObject.items.push( item._getItemAsObject() );
        }

        console.log(formObject);
        return formObject;
    }

    #itemValidityChangedHandler( event )
    {
        this.#checkValidity();
    }

    #fillForm( object = {} )
    {
        //console.log( "#fillForm" ); // ERROR SOMEWHERE WE FILL ON NAME PROPERTY
        //console.log( object );
        // we store the immutable id property
        if( object._id !== undefined )
        {
            this.#_id = object._id;
        }
        /*
        for( const item of this.#items )
        {
            // we check if the field exist. If yes we pass the entire object and let the item parse it
            const field = item.field;
            console.log("#fillForm fiels = ", field);
            if( field )
            {
                const model = ObjectUtils.getObjectByProperty( object, field );
                console.log(model);
                if( model )
                {
                    item._fillItem(object);
                }
            }
        }
            */
        
        for( const item of this.#items )
        {
            item._fillItem(object);
        }
    }

    /**
     * Fill the form with an object. Here with the object comin' from the get request of the AxialServiceComponentBase
     * @param { Object } object 
     */
    _fillForm( object )
    {
        this.#fillForm( object );
        //this.#checkValidity();
    }

    clearForm()
    {
        this.#postButton.enabled = false;
        this.#postButton.loading = false;
        for( const item of this.#items )
        {
            //if( item._clearItem ) { item._clearItem(); }
        }
    }

    /**
     * Utility to parse the defaults from the 'axial-defaults' attribute string. The result is stored and then passed to the post object
     */
    #parseDefaults()
    {
        // quick coding : just one coma and one default
        //
        if( this.#defaults && this.#defaults !== "" )
        {
            const defaultsArray = this.#defaults.split("&");
            console.log(defaultsArray);

            for( const def of defaultsArray )
            {
                const coma = StringUtils.countChar( ",", def );
                if( coma === 1 )
                {
                    const a = def.split(",");
                    if( a[0] !== "" )
                    {
                        this.#defaultsObject[a[0]] = a[1];
                    }
                }
            }
        }
    }
}

window.customElements.define("axial-service-form", AxialServiceForm);
export { AxialServiceForm }