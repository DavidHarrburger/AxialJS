"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialViewBase } from "../../view/AxialViewBase.js";

class AxialAdminEventViewFinal extends AxialViewBase
{
    /// elements

    /** @type { AxialServiceButton } */
    #saveButton;

    /// events
    /** @type { Function } */
    #boundSaveHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-event-view-final-template";
        //this.postPath = "./api/events/set";
        this.#boundSaveHandler = this.#saveHandler.bind(this);
    }

    _preparePostData()
    {
        const uuid = window.AXIAL.userUuid;
    }

    _buildComponent()
    {
        this.#saveButton = this.shadowRoot.getElementById("saveButton");

        if( this.#saveButton )
        {
            this.#saveButton.addEventListener("click", this.#boundSaveHandler);
        }
    }

    #saveHandler( event )
    {
        console.log(window.AXIAL.userUuid)
    }
    
}

window.customElements.define("axial-admin-event-view-final", AxialAdminEventViewFinal);
export { AxialAdminEventViewFinal }