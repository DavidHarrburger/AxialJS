"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialTogglePasswordButton } from "../button/AxialTogglePasswordButton.js";
import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { PathUtils } from "../utils/PathUtils.js";
import { AxialAccordionContainer } from "../accordion/AxialAccordionContainer.js";

class AxialAuthLogin extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #path = "./api/auth/signin";

    /// elements
    /** @type { HTMLInputElement } */
    #email;

    /** @type { HTMLInputElement } */
    #password;

    /** @type { AxialTogglePasswordButton } */
    #toggle;

    /** @type { AxialServiceButton } */
    #connectButton;

    /** @type { AxialAccordionContainer } */
    #messageContainer;

    /** @type { HTMLElement } */
    #message;

    /// events
    /** @type { Function } */
    #boundButtonHandler;

    /** @type { Function } */
    #boundToggleHandler;

    /** @type { Function } */
    #boundInputChangeHandler;

    /** @type { Function } */
    #boundMessageTimeoutHandler;

    constructor()
    {
        super();
        this.classList.add("axial_auth_login");
        this.template = "axial-auth-login-template";

        this.#path = PathUtils.getPathFromRelative( this.#path );

        this.#boundToggleHandler = this.#toggleHandler.bind(this);
        this.#boundInputChangeHandler = this.#inputChangeHandler.bind(this);
        this.#boundButtonHandler = this.#buttonHandler.bind(this);
        this.#boundMessageTimeoutHandler = this.#messageTimeoutHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#email = this.shadowRoot.getElementById("email");
        this.#password = this.shadowRoot.getElementById("password");
        this.#toggle = this.shadowRoot.getElementById("toggle");
        this.#connectButton = this.shadowRoot.getElementById("connectButton");

        this.#messageContainer = this.shadowRoot.getElementById("messageContainer");
        this.#message = this.shadowRoot.getElementById("message");

        if( this.#email )
        {
            this.#email.addEventListener("change", this.#boundInputChangeHandler);
        }

        if( this.#password )
        {
            this.#password.addEventListener("change", this.#boundInputChangeHandler);
        }

        if( this.#toggle )
        {
            this.#toggle.addEventListener("toggleChanged", this.#boundToggleHandler);
        }

        if( this.#connectButton )
        {
            this.#connectButton.enabled = false;
            this.#connectButton.addEventListener("click", this.#boundButtonHandler);
        }
    }

    #toggleHandler( event )
    {
        if( this.#password )
        {
            this.#password.type = this.#toggle.selected === true ?  "text": "password";
        }
    }

    #inputChangeHandler( event )
    {
        this.#checkValidity();
    }

    #checkValidity()
    {
        const emailValid = this.#email.validity.valid;
        const passValid = this.#password.validity.valid;
        if( emailValid === true && passValid === true )
        {
            this.#connectButton.enabled = true;
        }
        else
        {
            this.#connectButton.enabled = false;
        }
    }

    #buttonHandler( event )
    {
        this.#connectButton.enabled = false;
        this.#connectButton.loading = true;
        this.#requestLogin();
    }

    async #requestLogin()
    {
        try
        {
            const infos = { email: this.#email.value, password: this.#password.value };
            const response = await fetch( this.#path, { method: "POST", body: JSON.stringify(infos), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            console.log(json);
            if( json && json.status )
            {
                if( json.status === "ok" )
                {
                    const loginSuccessEvent = new CustomEvent("loginSuccess", { detail: json } );
                    this.dispatchEvent(loginSuccessEvent);
                }
                else if( json.status === "ko" )
                {
                    this.#showErrorMessage("Email et / ou mot de passe incorrect. Veuillez réessayer svp.");
                    this.#reinit();
                }
            }
            else
            {
                this.#showErrorMessage("Une erreur réseau s'est produite. Veuillez svp réessayer ultérieurement. N'hésitez pas à contacter le support client.");
                this.#reinit();

                const loginErrorEvent = new CustomEvent("loginError");
                this.dispatchEvent(loginErrorEvent);
            }

        }
        catch( err )
        {
            console.log(err);
            
            this.#showErrorMessage("Une erreur réseau s'est produite. Veuillez svp réessayer ultérieurement. N'hésitez pas à contacter le support client.");
            this.#reinit();
            
            const loginErrorEvent = new CustomEvent("loginError");
            this.dispatchEvent(loginErrorEvent);
        }
        finally
        {
            //this.#clearForm();
        }
    }

    #showErrorMessage( message )
    {
        console.log("show message")
        if( message === undefined || typeof message !== "string" )
        {
            console.warn("check login");
        }
        this.#message.innerHTML = message;
        this.#messageContainer.open();
    }

    focusFirst()
    {
        
    }

    #reinit()
    {
        this.#email.value = "";
        this.#password.value = "";
        this.#connectButton.enabled = false;
        this.#connectButton.loading = false;

        window.setTimeout( this.#boundMessageTimeoutHandler, 10000 );
    }

    #messageTimeoutHandler()
    {
        this.#messageContainer.close();
    }
}

window.customElements.define("axial-auth-login", AxialAuthLogin);
export { AxialAuthLogin }