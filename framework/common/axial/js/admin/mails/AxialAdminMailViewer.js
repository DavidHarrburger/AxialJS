"use strict"

import { AxialComponentBase } from "../../core/AxialComponentBase.js"

class AxialAdminMailViewer extends AxialComponentBase
{
    /// vars
    /** @type { Array } */
    #mails;

    /** @type { Number } */
    #currentIndex = 0;

    /// elements
    /** @type { HTMLElement } */
    #header;

    constructor()
    {
        super();
        this.classList.add("axial_admin_mail_viewer");
        this.template = "axial-admin-mail-viewer-template";
    }

    get currentIndex() { return  this.#currentIndex; }
    set currentIndex( value )
    {
        if( isNaN( value ) === true )
        {
            throw new TypeError("Positive or Zero Number value required");
        }
        if( value < 0 )
        {
            throw new TypeError("Positive or Zero Number value required");
        }
        this.#currentIndex = value;
        this.#updateComponent();
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#header = this.shadowRoot.getElementById("header");
    }

    #updateComponent()
    {
        console.log("MalViewer.#updateComponent() at index = " + this.#currentIndex);
        const currentMailModel = this.#mails[this.currentIndex];
        if( currentMailModel )
        {
            if( this.#header )
            {
                this.#header.innerHTML = currentMailModel.email;
            }
        }
    }

    _onDataChanged()
    {
        super._onDataChanged();
        console.log("data in ze mailViewer");
        this.#mails = this.data;
        this.#updateComponent();
    }
}

window.customElements.define("axial-admin-mail-viewer", AxialAdminMailViewer);
export { AxialAdminMailViewer }
