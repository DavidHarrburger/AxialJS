"use strict"

import { DomUtils } from "../../utils/DomUtils.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAdminDatabaseItem } from "./AxialAdminDatabaseItem.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialAdminDatabaseCreatePopup } from "./AxialAdminDatabaseCreatePopup.js";


class AxialAdminDatabaseView extends AxialAdminViewBase
{
    /// VARS
    /** @type { String } */
    #databaseGetAllPath = "../api/database/all";

    /** @type { Boolean } */
    #isBuilt = false;

    /// UI
    /** @type { HTMLElement } */
    #grid;

    /** @type { AxialButton } */
    #createButton;

    /** @type { AxialAdminDatabaseCreatePopup } */
    #createPopup;

    /// EVENTS
    /** @type { Function } */
    #boundCreateButtonClickHandler;

    /** @type { Function } */
    #boundCreatePopupHiddenHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-database-view-template";
        this.#boundCreateButtonClickHandler = this.#createButtonClickHandler.bind(this);
        this.#boundCreatePopupHiddenHandler = this.#createPopupHiddenHandler.bind(this);
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    _finalizeComponent()
    {
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

        this.#createPopup = AxialPopupManager.getPopupById("databaseCreatePopup");
        if( this.#createPopup )
        {
            this.#createPopup.addEventListener("popupHidden", this.#boundCreatePopupHiddenHandler);
        }
    }

    #createButtonClickHandler( event )
    {
        if( this.#createPopup )
        {
            this.#createPopup.show();
        }
    }

    _onViewEntered()
    {
        this.getAllDatabases();
    }

    async getAllDatabases()
    {
        try
        {
            await this.#getDatabases();
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

    async #getDatabases()
    {
        try
        {
            const response = await fetch( this.#databaseGetAllPath, { method: "GET", headers: { "Content-Type":"application/json" } } );
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
        DomUtils.cleanElement( this.#grid );
        for( const model of this.data.content )
        {
            //console.log(model);
            const databaseItem = new AxialAdminDatabaseItem();
            this.#grid.appendChild( databaseItem );
            databaseItem.data = model;
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #createPopupHiddenHandler( event )
    {
        this.getAllDatabases();
    }

}
window.customElements.define("axial-admin-database-view", AxialAdminDatabaseView);
export { AxialAdminDatabaseView }
