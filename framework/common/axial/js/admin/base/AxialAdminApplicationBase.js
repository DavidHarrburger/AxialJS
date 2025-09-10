"use strict";

import { AxialApplicationBase } from "../../core/AxialApplicationBase.js";

import { AxialBurgerButton } from "../../button/AxialBurgerButton.js";
import { AxialViewBase } from "../../view/AxialViewBase.js";
import { AxialAdminViewBase } from "./AxialAdminViewBase.js";
import { AxialViewerBase } from "../../view/AxialViewerBase.js";
import { AxialToggleButtonGroupBase } from "../../button/AxialToggleButtonGroupBase.js";

import { AxialTogglePanelButton } from "../button/AxialTogglePanelButton.js";
import { AxialSignoutButton } from "../button/AxialSignoutButton.js"; // change to auth manager / auth box
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { AxialPopupBase } from "../../popup/AxialPopupBase.js";

import { PathUtils } from "../../utils/PathUtils.js";

// REVIEW ALL IMPORTS TO HAVE EVERYTHING AT THE BEGINNING 
// WE SHOULD ONLY IMPORT COMPONENTS RELATIVE TO THE CURRENT ADMIN PAGE

class AxialAdminApplicationBase extends AxialApplicationBase
{
    /// vars
    /** @type { String } */
    #userUuid;

    /** @type { String } */
    #userPath = "./api/data/get/?c=users&m=user_base";

    /** @type { Object } */
    #userObject;

    /// elements
    /** @type { HTMLElement } */
    #panel;

    /** @type { AxialBurgerButton } */
    #burgerButton;

    /** @type { AxialToggleButtonGroupBase } */
    #panelToggles;

    /** @type { AxialViewerBase } */
    #mainViewer;

    /** @type { HTMLElement } */
    #authName;

    /** @type { HTMLElement } */
    #authPhoto;

    /// events
    /** @type { Function } */
    #boundMainViewerChangedHandler;
    
    /** @type { Function } */
    #boundPanelTogglesIndexChangedHandler;

    /** @type { Function } */
    #boundBurgerHandler;

    /** @type { Function } */
    #boundPopupHiddenHandler;

    constructor()
    {
        super();

        this.#userPath = PathUtils.getPathFromRelative(this.#userPath);

        this.#boundMainViewerChangedHandler = this.#mainViewerChangedHandler.bind(this);
        this.#boundPanelTogglesIndexChangedHandler = this.#panelTogglesIndexChangedHandler.bind(this);
        this.#boundBurgerHandler = this.#burgerHandler.bind(this);
        this.#boundPopupHiddenHandler = this.#popupHiddenHandler.bind(this);
    }

    /**
     * @readonly
     */
    get userObject() { return this.#userObject; }

    /**
     * @readonly
     */
    get userUuid() { return this.#userUuid; }

    /**
     * @type { AxialViewerBase }
     * @readonly
     */
    get mainViewer() { return this.#mainViewer; }

    async #getUser()
    {
        try
        {
            const path = this.#userPath + "&f=uuid," + this.#userUuid;
            const response = await fetch( path, { method: "GET", headers: { "Content-Type":"application/json", "Cache-Control": "no-cache" } } );
            const json = await response.json();
            if( json && json.content && Array.isArray(json.content) && json.content.length === 1 )
            {
                this.#userObject = json.content[0];
            }
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            this.#updateApplicationWithUser();
            this._onApplicationUserReady();
            // dispatch
        }
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );

        // panel
        this.#panel = document.getElementById("panel");
        this.#panelToggles = document.getElementById("panelToggles");
        if( this.#panelToggles )
        {
            this.#panelToggles.forceSelection = true;
            this.#panelToggles.selectedIndex = 0;
        }
        

        // viewer
        this.#mainViewer = document.getElementById("mainViewer");

        // burger
        this.#burgerButton = document.getElementById("burgerButton");

        // authbox
        this.#authName = document.getElementById("authName");
        this.#authPhoto = document.getElementById("authPhoto");
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );

        if( this.#mainViewer )
        {
            this.#mainViewer.addEventListener("viewerChanged", this.#boundMainViewerChangedHandler);
        }

        if( this.#panelToggles )
        {
            this.#panelToggles.addEventListener("indexChanged", this.#boundPanelTogglesIndexChangedHandler);
        }

        if( this.#burgerButton )
        {
            this.#burgerButton.addEventListener("toggleChanged", this.#boundBurgerHandler);
        }
        
        this.useApplicationResize = true;

        const allPopups = AxialPopupManager.POPUPS;
        for( const popup of allPopups )
        {
            console.log( popup );
            popup.addEventListener("popupHidden", this.#boundPopupHiddenHandler);
        }

        const uuid = localStorage.getItem("axial_auth_uuid");
        if( uuid )
        {
            this.#userUuid = uuid;
            this.#getUser();
        }
    }

    _onApplicationResize()
    {
        super._onApplicationResize();

        const w = window.innerWidth;
        if( this.#panel && this.#burgerButton )
        {
            if( w >= 1200 )
            {
                this.#panel.style.transform = "translateX(0)";
            }
            else
            {
                if( this.#burgerButton.selected === false )
                {
                    this.#panel.style.transform = "translateX(-100%)";
                }
            }
        }
    }

    #updateApplicationWithUser()
    {
        if( this.#userObject )
        {
            document.title = this.#userObject.first_name;
            if( this.#authName ) { this.#authName.innerHTML = this.#userObject.first_name; }
            if( this.#authPhoto )
            {
                if( this.#userObject.image_main && this.#userObject.image_main !== "" )
                {
                    const imageUrl = new URL( this.#userObject.image_main, window.location.origin);
                    this.#authPhoto.src = imageUrl.href;
                    this.#authPhoto.style.display = "block";
                }
                else
                {
                    this.#authPhoto.style.display = "none";
                }
            }
        }
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
        const w = window.innerWidth;
        if( w < 1200 )
        {
            this.#burgerButton.selected = false;
            this.#panel.style.transform = "translateX(-100%)";
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #mainViewerChangedHandler( event )
    {
        const currentView = event.detail.newView;
        //console.log("should load data");
        //currentView.loadGetData();
        this._onApplicationViewChanged( currentView );
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

    #burgerHandler( event )
    {
        if( this.#panel )
        {
            this.#panel.style.transform = this.#burgerButton.selected === true ? "translateX(0)" : "translateX(-100%)";
        }
    }

}

export { AxialAdminApplicationBase }