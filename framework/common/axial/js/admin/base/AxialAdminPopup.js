"use strict"

import { AxialPopupBase } from "../../popup/AxialPopupBase.js";
import { AxialButton } from "../../button/AxialButton.js";

class AxialAdminPopup extends AxialPopupBase
{
    /** @type { HTMLElement } */
    #titleElement;

    /** @type { AxialButton } */
    #closer;

    /** @type { String } */
    #title = "TITLE";

    /** @type { Function } */
    #boundCloserClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_admin_popup");
        this.template = "axial-admin-popup-template";
        this.#boundCloserClickHandler = this.#closerClickHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-position", "axial-animation", "axial-function", "axial-duration", "axial-title" ];
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#titleElement = this.shadowRoot.getElementById("title");
        if( this.#titleElement )
        {
            this.#titleElement.innerHTML = this.title;
        }

        this.#closer = this.shadowRoot.getElementById("closer");
        if( this.#closer )
        {
            this.#closer.addEventListener("click", this.#boundCloserClickHandler);
        }
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
    
        if( name === "axial-title" )
        {
            this.title = newValue;
        }
        
    }

    #closerClickHandler( event )
    {
        this.hide();
    }

    get title() { return this.#title; }
    set title( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        this.#title = value;
        if( this.#titleElement )
        {
            this.#titleElement.innerHTML = this.title;
        }
    }
}
window.customElements.define("axial-admin-popup", AxialAdminPopup);
export { AxialAdminPopup }