"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

import { AxialTogglePasswordButton } from "../admin/button/AxialTogglePasswordButton.js";
import { AxialServiceButton } from "../button/AxialServiceButton.js";

class AxialAuthRegister extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #path = "../../api/auth/signup";

    /** @type { RegExp } */
    #lowerRegex = /[a-z]/;

    /** @type { RegExp } */
    #upperRegex = /[A-Z]/;

    /** @type { RegExp } */
    #numberRegex = /[0-9]/;

    /** @type { RegExp } */
    #specialRegex = /[!?#-_@]/;


    /// elements
    /** @type { HTMLInputElement } */
    #username;

    /** @type { HTMLInputElement } */
    #email;

    /** @type { HTMLInputElement } */
    #password;

    /** @type { AxialTogglePasswordButton } */
    #toggle;

    /** @type { AxialServiceButton } */
    #button;

    /** @type { HTMLElement } */
    #lowerPass;

    /** @type { HTMLElement } */
    #upperPass;

    /** @type { HTMLElement } */
    #numberPass;

    /** @type { HTMLElement } */
    #specialPass;

    /** @type { HTMLElement } */
    #countPass;

    /// events
    /** @type { Function } */
    #boundButtonHandler;

    /** @type { Function } */
    #boundToggleHandler;

    /** @type { Function } */
    #boundInputChangeHandler;

    /** @type { Function } */
    #boundPassInputHandler;


    constructor()
    {
        super();
        this.classList.add("axial_auth_register");
        this.template = "axial-auth-register-template";

        this.#boundToggleHandler = this.#toggleHandler.bind(this);
        this.#boundInputChangeHandler = this.#inputChangeHandler.bind(this);
        this.#boundPassInputHandler = this.#passInputHandler.bind(this);
        this.#boundButtonHandler = this.#buttonHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#username = this.shadowRoot.getElementById("username");
        this.#email = this.shadowRoot.getElementById("email");
        this.#password = this.shadowRoot.getElementById("password");
        this.#toggle = this.shadowRoot.getElementById("toggle");
        this.#button = this.shadowRoot.getElementById("button");

        this.#lowerPass = this.shadowRoot.getElementById("lowerPass");
        this.#upperPass = this.shadowRoot.getElementById("upperPass");
        this.#numberPass = this.shadowRoot.getElementById("numberPass");
        this.#specialPass = this.shadowRoot.getElementById("specialPass");
        this.#countPass = this.shadowRoot.getElementById("countPass");

        if( this.#email )
        {
            this.#email.addEventListener("change", this.#boundInputChangeHandler);
        }

        if( this.#password )
        {
            this.#password.addEventListener("input", this.#boundPassInputHandler);
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
        console.log("input changed");
        this.#checkValidity();
    }

    #passInputHandler( event )
    {
        this.#checkPassword();
    }

    #checkPassword()
    {
        const tempPass = this.#password.value;

        const lower = this.#lowerRegex.test(tempPass);
        const upper = this.#upperRegex.test(tempPass);
        const number = this.#numberRegex.test(tempPass);
        const special = this.#specialRegex.test(tempPass);
        const count = tempPass.length >= 12;
        
        //console.log(lower, upper, number, special, count);

        this.#lowerPass.style.fontWeight = lower === true ? 500 : 400;
        this.#upperPass.style.fontWeight = upper === true ? 500 : 400;
        this.#numberPass.style.fontWeight = number === true ? 500 : 400;
        this.#specialPass.style.fontWeight = special === true ? 500 : 400;
        this.#countPass.style.fontWeight = count === true ? 500 : 400;

        if( lower === true && 
            upper === true &&
            number === true && 
            special === true && 
            count === true )
        {
            return true;
        } else { return false; }
    }

    #checkValidity()
    {
        const emailValid = this.#email.validity.valid;
        const passValid = this.#checkPassword();
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
        this.#sendRegistration();
    }

    async #sendRegistration()
    {
        try
        {
            const infos = { username: this.#username.value, email: this.#email.value, password: this.#password.value };
            const response = await fetch( this.#path, { method: "POST", body: JSON.stringify(infos), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            console.log(json);
            
            if( json )
                {
                    if( json.status && json.status === "ok" )
                    {
                        const registerSuccessEvent = new CustomEvent("registerSuccess", { detail: json } );
                        this.dispatchEvent(registerSuccessEvent);
                    }
                }
                else
                {
                    const registerErrorEvent = new CustomEvent("registerError");
                    this.dispatchEvent(verificationErrorEvent);
                }

        }
        catch( err )
        {
            console.log(err);
            const registerErrorEvent = new CustomEvent("registerError");
            this.dispatchEvent(registerErrorEvent);
        }
        finally
        {
            //this.#clearForm();
            
        }
    }
}

window.customElements.define("axial-auth-register", AxialAuthRegister);
export { AxialAuthRegister }