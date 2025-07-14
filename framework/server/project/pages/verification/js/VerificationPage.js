"use strict";

import { GlobalPage } from "../../../js/GlobalPage.js";

import { AxialAuthVerifyer } from "../../../../axial/js/auth/AxialAuthVerifyer.js";

class VerificationPage extends GlobalPage
{
    /// elements
    /** @type { AxialAuthVerifyer } */
    #verifyer;

    /// events
    /** @type { Function } */
    #boundVerificationSuccess;

    /** @type { Function } */
    #boundVerificationError;

    constructor()
    {
        super();
        this.#boundVerificationSuccess = this.#verficationSuccess.bind(this);
        this.#boundVerificationError = this.#verficationError.bind(this);
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
        this.#verifyer = document.getElementById("verifyer");
        if( this.#verifyer )
        {
            this.#verifyer.addEventListener("verificationSuccess", this.#boundVerificationSuccess);
            this.#verifyer.addEventListener("verficationError", this.#boundVerificationError);
        }
    }

    #verficationSuccess( event )
    {
        const path = event.detail.path;
        const urlBase = window.location.protocol + "//" + window.location.host + path;
        window.location = urlBase;
    }

    #verficationError( event ) {}
}

export { VerificationPage }