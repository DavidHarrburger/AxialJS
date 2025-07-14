"use strict";

import { AxialApplicationBase } from "../../core/AxialApplicationBase.js";

import { AxialViewBase } from "../../view/AxialViewBase.js";
import { AxialAdminViewBase } from "../../admin/base/AxialAdminViewBase.js";
import { AxialViewerBase } from "../../view/AxialViewerBase.js";

import { AxialTogglePanelButton } from "../../admin/button/AxialTogglePanelButton.js"; // migrate to button

class AxialToolApplicationBase extends AxialApplicationBase
{
    /// components / element
    /** @type { AxialToggleButtonGroupBase } */
    #desktopPanelToggles;

    /** @type { AxialToggleButtonGroupBase } */
    #mobilePanelToggles;

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

        // desktop panel
        this.#desktopPanelToggles = document.getElementById("desktopPanelToggles");
        this.#desktopPanelToggles.forceSelection = true;
        this.#desktopPanelToggles.selectedIndex = 0;

        // mobile panel
        this.#mobilePanelToggles = document.getElementById("mobilePanelToggles");
        this.#mobilePanelToggles.forceSelection = true;
        this.#mobilePanelToggles.selectedIndex = 0;

        // viewer
        this.#mainViewer = document.getElementById("mainViewer");
        
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );

        this.#mainViewer.addEventListener("viewerChanged", this.#boundMainViewerChangedHandler);
        this.#desktopPanelToggles.addEventListener("indexChanged", this.#boundPanelTogglesIndexChangedHandler);
        this.#mobilePanelToggles.addEventListener("indexChanged", this.#boundPanelTogglesIndexChangedHandler);
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #panelTogglesIndexChangedHandler( event )
    {
        console.log(event.target);
        const index = event.target.selectedIndex;
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
    }

}

export { AxialToolApplicationBase }