"use strict"

import { DomUtils } from "../../utils/DomUtils.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAdminModelItem } from "./AxialAdminModelItem.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialAdminModelPopup } from "./AxialAdminModelPopup.js";


class AxialAdminModelView extends AxialAdminViewBase
{
    /// VARS
    /** @type { String } */
    #modelGetAllPath = "../api/model/get?c=models";

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
        this.template = "axial-admin-model-view-template";
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
        if( this.#modelPopup )
        {
            this.#modelPopup.modelForm.mode = "new";
            this.#modelPopup.show();
        }
    }

    _onViewEntered()
    {
        this.getAllModels();
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

    async getAllModels()
    {
        try
        {
            await this.#getAllModels();
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

    async #getAllModels()
    {
        try
        {
            const response = await fetch( this.#modelGetAllPath, { method: "GET", headers: { "Content-Type":"application/json" } } );
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
        for( const model of this.data.content.collection )
        {
            //console.log(model);
            const modelItem = new AxialAdminModelItem();
            this.#grid.appendChild( modelItem );
            modelItem.data = model;
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #modelPopupHiddenHandler( event )
    {
        this.getAllModels();
    }

}
window.customElements.define("axial-admin-model-view", AxialAdminModelView);
export { AxialAdminModelView }
