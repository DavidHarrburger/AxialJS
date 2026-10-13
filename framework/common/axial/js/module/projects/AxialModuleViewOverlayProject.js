"use strict";

import { AxialModuleOverlay } from "../../overlay/AxialModuleOverlay.js";
import { AxialModuleCreateProjectOverlay } from "./AxialModuleCreateProjectOverlay.js";

class AxialModuleViewOverlayProject extends AxialModuleOverlay
{

    /// vars
    /** @type { String } */
    #createProjectOverlayId = "createProjectOverlay";

    /// elements
    /** @type { AxialButton } */
    #addButton;

    /** @type { AxialModuleCreateProjectOverlay } */
    #createProjectOverlay;

    /// events
    /** @type { Function } */
    #boundAddHandler;

    constructor()
    {
        super();
        this.template = "axial-module-view-overlay-project-template";
        this.#boundAddHandler = this.#addHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#addButton = this.shadowRoot.getElementById("addButton");
        this.#addButton.addEventListener("click", this.#boundAddHandler);

        this.#createProjectOverlay = document.getElementById( this.#createProjectOverlayId );
    }

    #addHandler( event )
    {
        console.log("clicliclick");
        this.hide();
        if( this.#createProjectOverlay )
        {
            this.#createProjectOverlay.createdFor = window.AXIAL.userUuid;
            this.#createProjectOverlay.show();
        }
    }
}

window.customElements.define("axial-module-view-overlay-project", AxialModuleViewOverlayProject);
export { AxialModuleViewOverlayProject }