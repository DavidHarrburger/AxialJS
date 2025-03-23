"use strict";

import { GlobalPage } from "../../../js/GlobalPage.js";
import { AxialLoginForm } from "../../../../axial/js/form/AxialLoginForm.js";
import { AxialNotifier } from "../../../../axial/js/application/AxialNotifier.js";

class LoginPage extends GlobalPage
{
    /// components
    /** @type { AxialNotifier } */
    #notifier;

    /** @type { AxialLoginForm } */
    #loginForm;

    /// events
    /** @type { Function } */
    #boundFormSendingHandler;

    /** @type { Function } */
    #boundFormSentHandler;

    /** @type { Function } */
    #boundFormErrorHandler;

    constructor()
    {
        super();

        this.#boundFormSendingHandler = this.#formSendingHandler.bind(this);
        this.#boundFormSentHandler = this.#formSentHandler.bind(this);
        this.#boundFormErrorHandler = this.#formErrorHandler.bind(this);
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );

        this.#notifier = document.getElementById("notifier");
        this.#loginForm = document.getElementById("loginForm");
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );

        this.#loginForm.addEventListener("formSending", this.#boundFormSendingHandler);
        this.#loginForm.addEventListener("formSent", this.#boundFormSentHandler);
        this.#loginForm.addEventListener("formError", this.#boundFormErrorHandler);
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSendingHandler( event )
    {
        console.log("login sending");
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSentHandler( event )
    {
        console.log("login sent");
        const response = event.detail.response;
        console.log( response );
        if( response && response.status === "ok" && response.message === "connected" && response.user !== undefined )
        {
            
            const user = response.user;
            const username = user.username;
            localStorage.setItem("axial_username", username );
            const redirectUrl = new URL(user.page, window.location.origin);
            window.location.href = redirectUrl.href;
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formErrorHandler( event )
    {
        if( this.#notifier )
        {
            this.#notifier.show("Connexion error");
        }
    }
}

export { LoginPage }