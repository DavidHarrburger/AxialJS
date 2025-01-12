"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";
import { InputUtils } from "../../utils/InputUtils.js";

class AxialAdminDatabaseCreateForm extends AxialServiceComponentBase
{
    /** @type { HTMLInputElement } */
    #dbname;

    /** @type { AxialServiceButton } */
    #button;

    /** @type { Function } */
    #boundInputChangedHandler;

    /** @type { Function } */
    #boundButtonClickHandler;

    /** @type { Function } */
    #boundServiceSuccessHandler;

    /** @type { Function } */
    #boundServiceErrorHandler;

    constructor()
    {
        super();
        this.classList.add("axial_admin_database_create_form");
        this.template = "axial-admin-database-create-form-template";
        
        this.#boundInputChangedHandler = this.#inputChangedHandler.bind(this);
        this.#boundButtonClickHandler = this.#buttonClickHandler.bind(this);

        this.#boundServiceSuccessHandler = this.#serviceSuccessHandler.bind(this);
        this.#boundServiceErrorHandler = this.#serviceErrorHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.addEventListener("serviceSuccess", this.#boundServiceSuccessHandler);
        this.addEventListener("serviceError", this.#boundServiceErrorHandler);

        this.#dbname = this.shadowRoot.getElementById("dbname");
        if( this.#dbname )
        {
            this.#dbname.addEventListener("input", this.#boundInputChangedHandler);
        }

        this.#button = this.shadowRoot.getElementById("button");
        if( this.#button )
        {
            //this.#button.enabled = false;
            this.#button.addEventListener("click", this.#boundButtonClickHandler);
        }

        //this.loadGetData();
    }

    initialize()
    {
        super.initialize();
        this.#button.enabled = false;
        this.#dbname.setAttribute( "disabled", "" );
        this.loadGetData();
    }

    _preparePostData()
    {
        const infos = { dbname: this.#dbname.value };
        return infos;
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #serviceSuccessHandler( event )
    {
        const method = event.detail.method
        if( method == "get" )
        {
            this.#dbname.removeAttribute( "disabled" );
        }
        else if( method == "post" )
        {
            this.#dbname.value = "" ;
            this.#button.loading = false;
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
        const value = this.#dbname.value;
        for( const model of this.getData.content )
        {
            if( model.name == value )
            {
                exists = true;
            }
        }
        return exists;
    }

    #inputChangedHandler( event )
    {
        let valids = this.#dbname.validity.valid;
        let exists = this.#checkNameValidity();
        
        if( valids === true && exists === false )
        {
            this.#button.enabled = true;
        }
        else
        {
            this.#button.enabled = false;
        }
    }

    #buttonClickHandler( event )
    {
        this.#button.enabled = false;
        this.#button.loading = true;
        this.loadPostData();
    }
}
window.customElements.define("axial-admin-database-create-form", AxialAdminDatabaseCreateForm);
export { AxialAdminDatabaseCreateForm }