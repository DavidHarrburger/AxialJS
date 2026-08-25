"use strict";

///
/// APPLICATION
///

import { AxialWebApplicationBase } from "./AxialWebApplicationBase.js";

///
/// BUTTON
///

import { AxialBurgerButton } from "../button/AxialBurgerButton.js";
import { AxialToggleButtonGroup } from "../button/AxialToggleButtonGroup.js";
import { AxialSignoutButton } from "../button/AxialSignoutButton.js";
import { AxialTogglePanelButton } from "../button/AxialTogglePanelButton.js";

///
/// POPUP
///

import { AxialPopupBase } from "../popup/AxialPopupBase.js";
import { AxialPopup } from "../popup/AxialPopup.js";
import { AxialModulePopup } from "../popup/AxialModulePopup.js";
import { AxialPopupManager } from "../popup/AxialPopupManager.js";

///
/// VIEW
///

import { AxialViewer } from "../view/AxialViewer.js";
import { AxialViewBase } from "../view/AxialViewBase.js";
import { AxialView } from "../view/AxialView.js";
import { AxialModuleView } from "../view/AxialModuleView.js";

///
/// FORM
///

import { AxialForm } from "../forms/AxialForm.js";
import { AxialFormDivider } from "../forms/AxialFormDivider.js";
import { AxialFormItemBase } from "../forms/AxialFormItemBase.js";
import { AxialFormItem } from "../forms/AxialFormItem.js";
import { AxialFormItemInputs } from "../forms/AxialFormItemInputs.js";
import { AxialFormItemWeekPlanning } from "../forms/AxialFormItemWeekPlanning.js";

class AxialWebModuleApplicationBase extends AxialWebApplicationBase
{
    /// elements
    /** @type { HTMLElement } */
    #modulePanel;

    /** @type { AxialBurgerButton } */
    #moduleMenuButton;

    /** @type { AxialToggleButtonGroup } */
    #moduleToggles;

    /** @type { AxialViewer } */
    #moduleViewer;

    /// events
    /** @type { Function } */
    #boundModuleViewerChangedHandler;
    
    /** @type { Function } */
    #boundModuleTogglesIndexChangedHandler;

    /** @type { Function } */
    #boundModuleMenuHandler;

    /** @type { Function } */
    #boundPopupHiddenHandler;

    constructor()
    {
        super();

        this.#boundModuleViewerChangedHandler = this.#moduleViewerChangedHandler.bind(this);
        this.#boundModuleTogglesIndexChangedHandler = this.#moduleTogglesIndexChangedHandler.bind(this);
        this.#boundModuleMenuHandler = this.#moduleMenuHandler.bind(this);
        this.#boundPopupHiddenHandler = this.#popupHiddenHandler.bind(this);
    }

    /**
     * @type { AxialViewer }
     * @readonly
     */
    get moduleViewer() { return this.#moduleViewer; }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );

        // panel
        this.#modulePanel = document.getElementById("axialModulePanel");
        
        // toggles
        this.#moduleToggles = document.getElementById("axialModuleToggles");
        
        if( this.#moduleToggles )
        {
            this.#moduleToggles.forceSelection = true;
            this.#moduleToggles.selectedIndex = 0;
        }
        
        // viewer
        this.#moduleViewer = document.getElementById("axialModuleViewer");

        // burger
        this.#moduleMenuButton = document.getElementById("axialModuleMenuButton");
        
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );

        if( this.#moduleViewer )
        {
            this.#moduleViewer.addEventListener("viewerChanged", this.#boundModuleViewerChangedHandler);
        }

        if( this.#moduleToggles )
        {
            this.#moduleToggles.addEventListener("indexChanged", this.#boundModuleTogglesIndexChangedHandler);
        }

        if( this.#moduleMenuButton )
        {
            this.#moduleMenuButton.addEventListener("toggleChanged", this.#boundModuleMenuHandler);
        }
        
        this.useApplicationResize = true;

        const allPopups = AxialPopupManager.POPUPS;
        for( const popup of allPopups )
        {
            popup.addEventListener("popupHidden", this.#boundPopupHiddenHandler);
        }
    }

    _onApplicationResize()
    {
        super._onApplicationResize();

        const w = window.innerWidth;
        if( this.#modulePanel && this.#moduleMenuButton )
        {
            if( w >= 1200 )
            {
                this.#modulePanel.style.transform = "translateX(0)";
            }
            else
            {
                if( this.#moduleMenuButton.selected === false )
                {
                    this.#modulePanel.style.transform = "translateX(-100%)";
                }
            }
        }
        
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #moduleTogglesIndexChangedHandler( event )
    {
        
        const index = this.#moduleToggles.selectedIndex;
        if( this.#moduleViewer )
        {
            this.#moduleViewer.gotoViewByIndex( index );
        }
        const w = window.innerWidth;
        if( w < 1200 )
        {
            this.#moduleMenuButton.selected = false;
            this.#modulePanel.style.transform = "translateX(-100%)";
        }
        
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #moduleViewerChangedHandler( event )
    {
        const currentView = event.detail.newView;
        if( this._onApplicationViewChanged )
        {
            this._onApplicationViewChanged( currentView );
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #popupHiddenHandler( event )
    {
        const popup = event.currentTarget;
        this._onApplicationPopupHidden( popup );
    }

    /**
     * @abstract
     * @param { AxialViewBase } view 
     */
    _onApplicationViewChanged( view ) {}

    /**
     * @abstract
     * @param { AxialPopupBase } popup
     */
    _onApplicationPopupHidden( popup ) {}

    /**
     * @abstract
     */
    _onApplicationUserReady() {}

    #moduleMenuHandler( event )
    {
        if( this.#modulePanel )
        {
            this.#modulePanel.style.transform = this.#moduleMenuButton.selected === true ? "translateX(0)" : "translateX(-100%)";
        }
    }

}

export { AxialWebModuleApplicationBase }