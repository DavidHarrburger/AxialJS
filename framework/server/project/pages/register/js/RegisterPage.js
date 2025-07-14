"use strict";

import { GlobalPage } from "../../../js/GlobalPage.js";

import { AxialAuthRegister } from "../../../../axial/js/auth/AxialAuthRegister.js";

class RegisterPage extends GlobalPage
{
    /// elements
    /** @type { AxialAuthRegister } */
    #register;

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