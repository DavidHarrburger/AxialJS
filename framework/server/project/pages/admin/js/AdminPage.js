"use strict"

import { GlobalPage } from "../../../js/GlobalPage.js";
import { AxialToggleButtonGroupBase } from "../../../../axial/js/button/AxialToggleButtonGroupBase.js";
import { AxialNotifier } from "../../../../axial/js/application/AxialNotifier.js";
import { AxialViewerBase } from "../../../../axial/js/view/AxialViewerBase.js";

// admin globals
import { AxialTogglePanelButton } from "../../../../axial/js/admin/button/AxialTogglePanelButton.js";
import { AxialSignoutButton } from "../../../../axial/js/admin/button/AxialSignoutButton.js";
import { AxialAdminViewVase } from "../../../../axial/js/admin/base/AxialAdminViewBase.js";

class AdminPage extends GlobalPage
{
    /// components / elements
    /** @type { AxialNotifier } */
    #notifier;

    /** @type { AxialSignoutButton } */
    #signoutButton;

    /** @type { HTMLElement } */
    #usernameElement;

    /** @type { AxialToggleButtonGroupBase } */
    #panelToggles;

    /** @type { AxialViewerBase } */
    #mainViewer;

    /// events
    /** @type { Function } */
    #boundMainViewerChangedHandler;
    
    /** @type { Function } */
    #boundPanelTogglesIndexChangedHandler;

    constructor()
    {
        super();

        this.#boundMainViewerChangedHandler = this.#mainViewerChangedHandler.bind(this);
        this.#boundPanelTogglesIndexChangedHandler = this.#panelTogglesIndexChangedHandler.bind(this);
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );

        this.#notifier = document.getElementById("notifier");

        this.#usernameElement = document.getElementById("usernameElement");
        const username = sessionStorage.getItem("axial_username");
        if( username )
        {
            this.#usernameElement.innerHTML = username ;
        }

        // panel
        this.#panelToggles = document.getElementById("panelToggles");
        this.#panelToggles.forceSelection = true;
        this.#panelToggles.selectedIndex = 0;

        // viewer
        this.#mainViewer = document.getElementById("mainViewer");
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );

        this.#mainViewer.addEventListener("viewerChanged", this.#boundMainViewerChangedHandler);
        this.#panelToggles.addEventListener("indexChanged", this.#boundPanelTogglesIndexChangedHandler);
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #panelTogglesIndexChangedHandler( event )
    {
        const index = this.#panelToggles.selectedIndex;
        if( this.#mainViewer )
        {
            this.#mainViewer.gotoViewByIndex( index );
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #mainViewerChangedHandler( event )
    {
        const currentView = event.detail.newView;
        // TO CHECK
        /*
        if( currentView && currentView._getServiceData )
        {
            currentView._getServiceData();
        }
        */
    }
}

export { AdminPage }