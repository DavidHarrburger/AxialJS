"use strict";

import { AxialApplicationBase } from "../core/AxialApplicationBase.js";
import { AxialBurgerButton } from "../button/AxialBurgerButton.js";
import { AxialNavigationHelper } from "../experimental/AxialNavigationHelper.js";

class AxialWebApplicationBase extends AxialApplicationBase
{
    /// elements
    /** @type { AxialBurgerButton } */
    #menuButton;

    /** @type { HTMLElement} */
    #menuPanel;

    /** @type { AxialNavigationHelper} */
    #desktopNavHelper;

    /** @type { AxialNavigationHelper} */
    #mobileNavHelper;

    /// events
    /** @type { Function } */
    #boundMenuButtonHandler;

    /** @type { Function } */
    #boundDesktopNavItemFoundHandler;

    /** @type { Function } */
    #boundMobileNavItemFoundHandler;

    /** @type { Function } */
    #boundNavigationItemClickHandler;

    constructor()
    {
        super();
        this.#boundMenuButtonHandler = this.#menuButtonHandler.bind(this);
        this.#boundDesktopNavItemFoundHandler = this.#desktopNavItemFoundHandler.bind(this);
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );

        this.#menuButton = document.getElementById("menuButton");
        if( this.#menuButton )
        {
            this.#menuButton.addEventListener("toggleChanged", this.#boundMenuButtonHandler);
        }
        this.#menuPanel = document.getElementById("menuPanel");

        this.#desktopNavHelper = document.getElementById("desktopNavHelper");
        if( this.#desktopNavHelper )
        {
            this.#desktopNavHelper.addEventListener("navigationItemFound", this.#boundDesktopNavItemFoundHandler);
            this.#desktopNavHelper._updateItems();
        }
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
    }

    #menuButtonHandler( event )
    {
        if( this.#menuPanel )
        {
            this.#menuPanel.style.transform = this.#menuButton.selected === true ? "translateX(0)" : "translateX(100%)";
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #desktopNavItemFoundHandler( event )
    {
        const item = event.detail.item;
        item.addEventListener("click", this.#boundNavigationItemClickHandler);
        item.style.cursor = "default";
        const line = item.children[1];
        if( line )
        {
            line.style.transitionProperty = "none";
            line.style.transform = "scale(1)";
        }
    }

    /**
     * 
     * @param { MouseEvent } event 
     */
    #navigationItemClickHandler( event )
    {
        event.preventDefault();
    }
}

export { AxialWebApplicationBase }