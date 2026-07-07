"use strict";

import { AxialWebApplicationBase } from "../../../../axial/js/core/AxialWebApplicationBase.js";
import { AxialAuthLogin } from "../../../../axial/js/auth/AxialAuthLogin.js";

class LoginPage extends AxialWebApplicationBase
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

        this.#login = document.getElementById("login");
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
        
        if( this.#login )
        {
            this.#login.addEventListener("loginSuccess", this.#boundLoginSuccess);
            this.#login.addEventListener("loginError", this.#boundLoginError);
        }
    }

    #loginSuccess( event )
    {
        window.location.href = "../verification/"; /// hmmmmm
    }

    #loginError( event ) {}
}

export { LoginPage }