"use strict";

import { AxialIconButton } from "../button/AxialIconButton.js";
import { AxialView } from "./AxialView.js";
import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";
import { StringUtils } from "../utils/StringUtils.js";
import { AxialModuleOverlay } from "../overlay/AxialModuleOverlay.js";

class AxialModuleView extends AxialView
{
    /** @type { String } */
    #title;

    /** @type { HTMLElement } */
    #titleElement;

    /** @type { AxialIconButton } */
    #ellipsisButton;

    /** @type { String } */
    #overlayId;

    /** @type { AxialModuleOverlay } */
    #overlay;

    /** @type { Function } */
    #boundEllipsisHandler;

    constructor()
    {
        super();
        this.template = "axial-module-view-template";
        this.#boundEllipsisHandler = this.#ellipsisHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-title", "axial-overlay"];
    }

    get title() { return this.#title; }
    set title( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#title = value.trim();
        if( this.#titleElement )
        {
            this.#titleElement.innerHTML = this.#title;
        }
    }

    get overlayId() { return this.#overlayId; }
    set overlayId( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#overlayId = value;
        this.#overlay = document.getElementById( this.#overlayId );
    }

    /** 
     * @type { AxialIconButton } 
     * @readonly
    */
    get ellipsisButton() { return this.#ellipsisButton; }

    _buildComponent()
    {
        super._buildComponent();

        this.#titleElement = this.shadowRoot.getElementById("title");
        if( this.#titleElement && this.#title !== undefined )
        {
            this.#titleElement.innerHTML = this.#title;
        }

        this.#ellipsisButton = this.shadowRoot.getElementById("ellipsisButton");
        if( this.#overlayId )
        {
            this.#overlay = document.getElementById(this.#overlayId);
            
        }
        if( this.#ellipsisButton )
        {
            this.#ellipsisButton.addEventListener("click", this.#boundEllipsisHandler);
        }
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-title" )
        {
            this.title = newValue;
        }

        if( name === "axial-overlay" )
        {
            if( StringUtils.isWhite( newValue ) === false )
            {
                this.#overlayId = newValue;
            }
        }
    }

    #ellipsisHandler( event )
    {
        if( this.#overlay )
        {
            this.#overlay.show();
            //console.log("ellipsiiiiiiiiiiiis");
        }
    }

}

window.customElements.define("axial-module-view", AxialModuleView);
export { AxialModuleView }