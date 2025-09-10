"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialViewBase } from "../../view/AxialViewBase.js";
import { AxialCalendarButton } from "../../date/AxialCalendarButton.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialAdminProjectViewCreation extends AxialViewBase
{
    /// vars
    

    /// elements
    /** @type { HTMLElement } */
    #main;

    /** @type { Array<HTMLInputElement> } */
    #inputs = new Array();

    /** @type { AxialButton } */
    #selectClientButton;

    /** @type { AxialButton } */
    #createClientButton;

    /** @type { AxialServiceButton } */
    #saveButton;

    /// styles
    /** @type { String } */
    #normalColor = "#232323";

    /** @type { String } */
    #errorColor = "#cc0000";

    /// events
    /** @type { Function } */
    #boundSelectClientHandler;

    /** @type { Function } */
    #boundCreateClientHandler;

    /** @type { Function } */
    #boundSaveHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-project-view-creation-template";
        this.postPath = "../api/projects/set";
        this.#boundSelectClientHandler = this.#selectClientHandler.bind(this);
        this.#boundCreateClientHandler = this.#createClientHandler.bind(this);
        this.#boundSaveHandler = this.#saveHandler.bind(this);
        
    }

    _preparePostData()
    {
        //return this.#getViewAsObject();
    }

    _buildComponent()
    {
        this.#main = this.shadowRoot.getElementById("main");
        if( this.#main )
        {
            this.#inputs = Array.from( this.#main.getElementsByTagName("input") );
        }

        this.#selectClientButton = this.shadowRoot.getElementById("selectClientButton");
        if( this.#selectClientButton)
        {
            this.#selectClientButton.addEventListener("click", this.#boundSelectClientHandler);
        }

        this.#createClientButton = this.shadowRoot.getElementById("createClientButton");
        if( this.#createClientButton)
        {
            this.#createClientButton.addEventListener("click", this.#boundCreateClientHandler);
        }
        

        this.#saveButton = this.shadowRoot.getElementById("saveButton");
        if( this.#saveButton )
        {
            this.#saveButton.enabled = false;
            this.#saveButton.addEventListener("click", this.#boundSaveHandler);
        }
    }

    #selectClientHandler( event )
    {
        const searchPopup = AxialPopupManager.getPopupById("searchPopup");
        if( searchPopup )
        {
            searchPopup.show();
        }
    }

    #createClientHandler( event )
    {
        const clientPopup = AxialPopupManager.getPopupById("clientPopup");
        if( clientPopup )
        {
            clientPopup.show();
        }
    }

    #saveHandler( event )
    {
        this.#saveButton.loading = true;
        //this.loadPostData();
        //console.log(window.AXIAL.userUuid)
        //const eventStepCompleted = new CustomEvent("eventStepCompleted", { bubbles: false } );
        //this.dispatchEvent(eventStepCompleted);
    }

    #getViewAsObject()
    {
        let o = {};
        for( const input of this.#inputs )
        {
            const prop = input.name;
            const value = input.value;
            o[prop] = value;
        }

        const uuid = window.AXIAL.userUuid;

        o.user_uuid = uuid;

        return o;
    }

    _onPostResponse()
    {
        console.log("project post response ok");
        this.#saveButton.loading = false;
        this.#saveButton.enabled = false;
        if( this.postData.content && this.postData.content.insertedId )
        {
            const projectStepCompleted = new CustomEvent("projectStepCompleted", { bubbles: false, detail: {_id: this.postData.content.insertedId } } );
            this.dispatchEvent(projectStepCompleted);
        }
    }

    #checkView()
    {
        let valid = true;
        
        
        if( this.#saveButton )
        {
            this.#saveButton.enabled = valid;
        }

    }

    init()
    {
        //this.#startCalendarButton.calendar.allowPast = false;
    }


    #inputChangedHandler( event )
    {
        const input = event.target;
        if( input.validity.valid === false )
        {
            input.style.borderColor = this.#errorColor;
        }
        else
        {
            input.style.borderColor = this.#normalColor;
        }
        this.#checkView();
    }

    
}

window.customElements.define("axial-admin-project-view-creation", AxialAdminProjectViewCreation);
export { AxialAdminProjectViewCreation }