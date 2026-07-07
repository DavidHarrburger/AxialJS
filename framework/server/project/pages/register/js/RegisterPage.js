"use strict";

import { AxialWebApplicationBase } from "../../../../axial/js/core/AxialWebApplicationBase.js";

import { AxialAuthRegister } from "../../../../axial/js/auth/AxialAuthRegister.js";
import { AxialAuthRegisterAddress } from "../../../../axial/js/auth/AxialAuthRegisterAddress.js"; 

class RegisterPage extends AxialWebApplicationBase
{
    /// elements
    /** @type { AxialAuthRegisterAddress } */
    #register;

    /// vars
    /** @type { String } */
    #referrer;

    /// events
    /** @type { Function } */
    #boundRegisterSuccess;

    /** @type { Function } */
    #boundRegisterError;
    
    constructor()
    {
        super();
        this.#boundRegisterSuccess = this.#registerSuccess.bind(this);
        this.#boundRegisterError = this.#registerError.bind(this);
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
        this.#register = document.getElementById("register");
        if( this.#register )
        {
            this.#register.addEventListener("registerSuccess", this.#boundRegisterSuccess);
            this.#register.addEventListener("registerError", this.#boundRegisterError);
        }
    }

    #registerSuccess( event )
    {
        window.location.href = "../verification/";
    }

    #registerError( event ) {}
}

export { RegisterPage }