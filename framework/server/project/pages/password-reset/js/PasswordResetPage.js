"use strict";

import { AxialWebApplicationBase } from "../../../../axial/js/core/AxialWebApplicationBase.js";
import { AxialAuthResetter } from "../../../../axial/js/auth/AxialAuthResetter.js";

class PasswordResetPage extends AxialWebApplicationBase
{
    /// elements
    /** @type { AxialAuthResetter } */
    #resetter;

    /// vars

    // see if i check the referrer
    /** @type { String } */
    #referrer;

    
    constructor()
    {
        super();
        //this.#boundRegisterSuccess = this.#registerSuccess.bind(this);
        //this.#boundRegisterError = this.#registerError.bind(this);
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
        this.#resetter = document.getElementById("resetter");
        /*
        if( this.#register )
        {
            this.#register.addEventListener("registerSuccess", this.#boundRegisterSuccess);
            this.#register.addEventListener("registerError", this.#boundRegisterError);
        }
        */
    }

    #registerSuccess( event )
    {
        window.location.href = "../verification/";
    }

    #registerError( event ) {}
}

export { PasswordResetPage }