"use strict"

import { DomUtils } from "../../utils/DomUtils.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAdminUserItem } from "./AxialAdminUserItem.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialAdminModelPopup } from "../models/AxialAdminModelPopup.js";


class AxialAdminUserView extends AxialAdminViewBase
{
    /// VARS
    /** @type { String } */
    //#userGetPath = "../api/model/get?c=users&m=user&u=65acf5edb5afb8ef6e2ec256";
    #userGetPath = "../api/model/get?c=users&m=user";

    /** @type { Boolean } */
    #isBuilt = false;

    /// UI
    /** @type { HTMLElement } */
    #grid;

    /** @type { AxialButton } */
    #createButton;

    /** @type { AxialAdminModelPopup } */
    #modelPopup;

    /// EVENTS
    /** @type { Function } */
    #boundCreateButtonClickHandler;

    /** @type { Function } */
    #boundModelPopupHiddenHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-user-view-template";
        this.#boundCreateButtonClickHandler = this.#createButtonClickHandler.bind(this);
        this.#boundModelPopupHiddenHandler = this.#modelPopupHiddenHandler.bind(this);
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        if( this.#isBuilt === true ) { return; }
        this.#isBuilt = true;

        this.#grid = this.shadowRoot.getElementById("grid");

        this.#createButton = this.shadowRoot.getElementById("createButton");
        if( this.#createButton )
        {
            this.#createButton.addEventListener("click", this.#boundCreateButtonClickHandler);
        }

        this.#modelPopup = AxialPopupManager.getPopupById("modelPopup");
        
    }

    #createButtonClickHandler( event )
    {
        console.log("create button user clicked");
        if( this.#modelPopup )
        {
            this.#modelPopup.modelForm.mode = "from";
            this.#modelPopup.modelForm.modelName = "user";
            this.#modelPopup.show();
        }
    }

    _onViewEntered()
    {
        this.getAllUsers();
        if( this.#modelPopup )
        {
            this.#modelPopup.addEventListener("popupHidden", this.#boundModelPopupHiddenHandler);
        }
    }

    _onViewLeaving()
    {
        if( this.#modelPopup )
        {
            this.#modelPopup.removeEventListener("popupHidden", this.#boundModelPopupHiddenHandler);
        }
    }

    async getAllUsers()
    {
        try
        {
            await this.#getAllUsers();
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            this.#updateView();
        }
    }

    async #getAllUsers()
    {
        try
        {
            const response = await fetch( this.#userGetPath, { method: "GET", headers: { "Content-Type":"application/json" } } );
            const json = await response.json();
            if( json )
            {
                this.data = json;
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }

    #updateView()
    {
        console.log("update view users");
        
        DomUtils.cleanElement( this.#grid );
        for( const model of this.data.content.collection )
        {
            //console.log(model);
            const userItem = new AxialAdminUserItem();
            this.#grid.appendChild( userItem );
            userItem.data = model;
        }
        
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #modelPopupHiddenHandler( event )
    {
        this.getAllUsers();
    }

}
window.customElements.define("axial-admin-user-view", AxialAdminUserView);
export { AxialAdminUserView }
