"use strict";

import { AxialButton } from "../../button/AxialButton.js";

class AxialSignoutButton extends AxialButton
{
    /** @type { String } */
    #path;

    /** @type { String } */
    #redirect;

    /** @type { Function } */
    #boundClickHandler;

    constructor()
    {
        super();
        this.#boundClickHandler = this.#clickHandler.bind(this);
        this.addEventListener("click", this.#boundClickHandler);
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#path = this.getAttribute("axial-path");
        this.#redirect = this.getAttribute("axial-redirect");
    }

    #clickHandler( event )
    {
        if( this.#path === undefined || this.#path === null || this.#path === "" )
        {
            throw new Error("property path must be defined");
        }
        this.#signout();
    }

    async #signout()
    {
        try
        {
            sessionStorage.clear();
            const response = await fetch( this.#path, { method: "POST", credentials: "same-origin" } );
            const json = response.json();

            if( json )
            {
                if( this.#redirect !== null && this.#redirect !== undefined && this.#redirect !== "" )
                {
                    window.location.href = this.#redirect;
                }
            }
        }
        catch(err)
        {

        }
    }
}

window.customElements.define("axial-signout-button", AxialSignoutButton);
export { AxialSignoutButton }