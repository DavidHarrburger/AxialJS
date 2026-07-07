"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialTogglePanelButton } from "../button/AxialTogglePanelButton.js";
import { AxialToggleButtonGroupBase } from "../../button/AxialToggleButtonGroupBase.js";
import { AxialViewerBase } from "../../view/AxialViewerBase.js";
import { AxialViewBase } from "../../view/AxialViewBase.js";


class AxialAdminAccountView extends AxialAdminViewBase
{
    /// elements
    /** @type { AxialViewerBase} */
    #viewer;

    /** @type { AxialToggleButtonGroupBase } */
    #bar;

    /// events
    /** @type { Function } */
    #boundIndexChangedHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-account-view-template";
        this.#boundIndexChangedHandler = this.#indexChangedHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#viewer = this.shadowRoot.getElementById("viewer");
        this.#bar = this.shadowRoot.getElementById("bar");
        if( this.#bar )
        {
            this.#bar.addEventListener("indexChanged", this.#boundIndexChangedHandler);
        }
    }
    _onViewEntering()
    {
        if( this.#bar && this.#bar.selectedIndex === -1 )
        {
            this.#bar.forceSelection = true;
            this.#bar.selectedIndex = 0;
        }
    }

    #indexChangedHandler( event )
    {
        this.#viewer.gotoViewByIndex( this.#bar.selectedIndex );
    }

}
window.customElements.define("axial-admin-account-view", AxialAdminAccountView);
export { AxialAdminAccountView }
