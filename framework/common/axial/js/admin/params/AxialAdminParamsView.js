"use strict"

import { AxialViewerBase } from "../../view/AxialViewerBase.js";
import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialToggleButtonGroupBase } from "../../button/AxialToggleButtonGroupBase.js";
import { AxialAdminToggleBarButton } from "../button/AxialAdminToggleBarButton.js";

import { AxialAdminParamsInformationBar } from "./AxialAdminParamsInformationBar.js";

class AxialAdminParamsView extends AxialAdminViewBase
{
    /** @type { AxialToggleButtonGroupBase } */
    #bar;

    /** @type { AxialViewerBase } */
    #viewer;

    /** @type { Function } */
    #boundBarIndexChangedHandler;

    constructor()
    {
        super();
        //this.classList.add("axial_admin_params_view");
        this.template = "axial-admin-params-view-template";
        this.#boundBarIndexChangedHandler = this.#barIndexChangedHandler.bind(this);
    }

    _onViewEntered()
    {
        console.log(this.#bar.toggles);
        console.log(this.#bar.selectedIndex);

        if( this.#bar && this.#bar.selectedIndex == -1 )
        {
            this.#bar.forceSelection = true;
            this.#bar.selectedIndex = 0;
            this.#bar.addEventListener("indexChanged", this.#boundBarIndexChangedHandler);
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#bar = this.shadowRoot.getElementById("bar");
        this.#viewer = this.shadowRoot.getElementById("viewer");
    }

    /**
     * @param { CustomEvent } event 
     */
    #barIndexChangedHandler( event )
    {
        if( this.#viewer )
        {
            const index = this.#bar.selectedIndex;
            this.#viewer.gotoViewByIndex( index );
        }
    }

}
window.customElements.define("axial-admin-params-view", AxialAdminParamsView);
export { AxialAdminParamsView }