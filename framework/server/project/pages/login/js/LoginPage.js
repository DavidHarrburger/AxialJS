"use strict";

import { GlobalPage } from "../../../js/GlobalPage.js";

import { AxialAuthLogin } from "../../../../axial/js/auth/AxialAuthLogin.js";

class LoginPage extends GlobalPage
{
    /// elements
    /** @type { AxialAuthLogin } */
    #login;

    /// events
    /** @type { Function } */
    #boundLoginSuccess;

    /** @type { Function } */
    #boundLoginError;
    
    constructor()
    {
        super();
        this.#boundLoginSuccess = this.#loginSuccess.bind(this);
        this.#boundLoginError = this.#loginError.bind(this);
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
        this.#login = document.getElementById("login");
        if( this.#login )
        {
            this.#login.addEventListener("loginSuccess", this.#boundLoginSuccess);
            this.#login.addEventListener("loginError", this.#boundLoginError);
        }
    }

    #loginSuccess( event )
    {
        window.location.href = "../verification/";
    }

    #loginError( event ) {}
}

export { LoginPage }