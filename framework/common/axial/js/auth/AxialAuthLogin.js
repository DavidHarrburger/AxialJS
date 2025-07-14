"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialTogglePasswordButton } from "../admin/button/AxialTogglePasswordButton.js";
import { AxialServiceButton } from "../button/AxialServiceButton.js";

class AxialAuthLogin extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #path = "../../api/auth/signin";


    /// elements
    /** @type { HTMLInputElement } */
    #email;

    /** @type { HTMLInputElement } */
    #password;

    /** @type { AxialTogglePasswordButton } */
    #toggle;

    /** @type { AxialServiceButton } */
    #button;


    /// events
    /** @type { Function } */
    #boundButtonHandler;

    /** @type { Function } */
    #boundToggleHandler;

    /** @type { Function } */
    #boundInputChangeHandler;

    constructor()
    {
        super();
        this.classList.add("axial_auth_login");
        this.template = "axial-auth-login-template";

        this.#boundToggleHandler = this.#toggleHandler.bind(this);
        this.#boundInputChangeHandler = this.#inputChangeHandler.bind(this);
        this.#boundButtonHandler = this.#buttonHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#email = this.shadowRoot.getElementById("email");
        this.#password = this.shadowRoot.getElementById("password");
        this.#toggle = this.shadowRoot.getElementById("toggle");
        this.#button = this.shadowRoot.getElementById("button");

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

        if( this.#button )
        {
            this.#button.enabled = false;
            this.#button.addEventListener("click", this.#boundButtonHandler);
        }
    }

    #toggleHandler( event )
    {
        if( this.#password )
        {
            this.#toggle.selected === true ? this.#password.type = "text": this.#password.type = "password";
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
            this.#button.enabled = true;
        }
        else
        {
            this.#button.enabled = false;
        }
    }

    #buttonHandler( event )
    {
        this.#button.enabled = false;
        this.#button.loading = true;
        this.#requestLogin();
    }

    async #requestLogin()
    {
        try
        {
            const infos = { email: this.#email.value, password: this.#password.value };
            const response = await fetch( this.#path, { method: "POST", body: JSON.stringify(infos), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            
            if( json )
            {
                if( json.status && json.status === "ok" )
                {
                    const loginSuccessEvent = new CustomEvent("loginSuccess", { detail: json } );
                    this.dispatchEvent(loginSuccessEvent);
                }
            }
            else
            {
                const loginErrorEvent = new CustomEvent("loginError");
                this.dispatchEvent(loginErrorEvent);
            }

        }
        catch( err )
        {
            console.log(err);
            const loginErrorEvent = new CustomEvent("loginError");
            this.dispatchEvent(loginErrorEvent);
        }
        finally
        {
            //this.#clearForm();
            
        }
    }
}

window.customElements.define("axial-auth-login", AxialAuthLogin);
export { AxialAuthLogin }