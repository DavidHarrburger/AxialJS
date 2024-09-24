"use strict"

import { AxialViewBase } from "../../view/AxialViewBase.js";
import { AxialViewerBase } from "../../view/AxialViewerBase.js";
import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialToggleButtonGroupBase } from "../../button/AxialToggleButtonGroupBase.js";
import { AxialAdminMediasLibrary } from "./AxialAdminMediasLibrary.js";


class AxialAdminMediasView extends AxialAdminViewBase
{
    /** @type { AxialToggleButtonGroupBase } */
    #bar;

    /** @type { AxialViewerBase } */
    #viewer;

    /** @type { AxialAdminMediasLibrary} */
    #library

    /** @type { Function } */
    #boundBarIndexChangedHandler;

    constructor()
    {
        super();
        //this.classList.add("axial_admin_params_view");
        this.template = "axial-admin-medias-view-template";
        this.#boundBarIndexChangedHandler = this.#barIndexChangedHandler.bind(this);
    }

    _onViewEntered()
    {
        if( this.#bar && this.#bar.selectedIndex == -1 )
        {
            this.#bar.forceSelection = true;
            this.#bar.selectedIndex = 0;
            this.#bar.addEventListener("indexChanged", this.#boundBarIndexChangedHandler);
        }
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#bar = this.shadowRoot.getElementById("bar");
        this.#viewer = this.shadowRoot.getElementById("viewer");
        this.#library = this.shadowRoot.getElementById("library");
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

            if( index == 1 )
            {
                this.#library.getAllFiles();
            }
        }
    }

}
window.customElements.define("axial-admin-medias-view", AxialAdminMediasView);
export { AxialAdminMediasView }