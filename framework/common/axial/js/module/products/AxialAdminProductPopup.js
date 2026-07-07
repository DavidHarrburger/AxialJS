"use strict";

import { AxialViewerBase } from "../../view/AxialViewerBase.js";
import { AxialViewerIndicator } from "../../view/AxialViewerIndicator.js";
import { AxialAdminPopup } from "../base/AxialAdminPopup.js";

class AxialAdminProductPopup extends AxialAdminPopup
{
    /// elements
    /** @type { AxialViewerBase } */
    #viewer;

    /** @type { AxialViewerIndicator } */
    #indicator;

    /// events
    /** @type { Function } */
    #boundServiceSuccessHandler;

    constructor()
    {
        super();
        this.#boundServiceSuccessHandler = this.#serviceSuccessHandler.bind(this);
        this.addEventListener("serviceSuccess", this.#boundServiceSuccessHandler);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#viewer = document.getElementById("popupProductViewer");
        this.#indicator = document.getElementById("popupProductIndicator");
    }

    _onShown()
    {
        this.#indicator.updateIndicator();
    }

    #serviceSuccessHandler( event )
    {
        console.log("I'm a Killer !!!");
        this.#viewer.next();
    }
}

window.customElements.define("axial-admin-product-popup", AxialAdminProductPopup);
export { AxialAdminProductPopup }