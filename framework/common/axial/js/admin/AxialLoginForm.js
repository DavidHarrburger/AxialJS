"use strict"

import { AxialButton } from "../button/AxialButton.js";
import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialLoginForm extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #path = "";

    /** @type { String } */
    #defaultColor = "#232323";

    /** @type { String } */
    #errorColor = "#f00";

    /** @type { String } */
    #validColor = "#0f0";

    /// ui
    /** @type { HTMLInputElement } */
    #email;

    /** @type { HTMLInputElement } */
    #password;

    /** @type { AxialButton } */
    #button;

    /** @type { Array<HTMLInputElement> } */
    #formElements = new Array();

    /// events
    /** @type { Function } */
    #boundFocusOutHandler;

    /** @type { Function } */
    #boundButtonClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_login_form");
        this.template = "axial-login-form-template";

        this.#boundFocusOutHandler = this.#focusOutHandler.bind(this);
        this.#boundButtonClickHandler = this.#buttonClickHandler.bind(this);
    }

    /**
     * Get or set the path to the login service / api
     * @type { String }
     */
    get path() { return this.#path; }
    set path( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#path = value;
    }

    connectedCallback()
    {
        super.connectedCallback();

        this.#email = this.shadowRoot.getElementById("email");
        this.#email.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#password = this.shadowRoot.getElementById("password");
        this.#password.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#formElements.push(this.#email, this.#password);

        this.#button = this.shadowRoot.getElementById("button");
        this.#button.addEventListener("click", this.#boundButtonClickHandler);
    }

    #checkFormValidity()
    {
        let formValid = true;
        for( const element of this.#formElements )
        {
            const elementValid = element.validity.valid;
            if( elementValid === false )
            {
                formValid = false;
                break;
            }
        }
        return formValid;
    }

    /**
     * Check form field on focus out and change colors if required
     * @param { FocusEvent } event 
     */
    #focusOutHandler( event )
    {
        const element = event.target;
        const isValid = element.validity.valid;

        if( isValid === true )
        {
            element.style.borderColor = this.#validColor;
        }
        else
        {
            element.style.borderColor = this.#errorColor;
        }
        const isValidForm = this.#checkFormValidity();
        if( isValidForm === true )
        {
            this.#button.style.opacity = "1";
            this.#button.style.pointerEvents = "auto";
        }
        else
        {
            this.#button.style.opacity = "0.5";
            this.#button.style.pointerEvents = "none";
        }
    }

    #buttonClickHandler( event )
    {
        this.#button.removeEventListener("click", this.#boundButtonClickHandler);
        this.#sendForm();
    }

    #clearForm()
    {
        for( const element of this.#formElements )
        {
            element.value = "";
            element.style.backgroundColor = "#fff";
            element.style.borderColor = this.#defaultColor;
        }

        this.#button.style.opacity = "0.5";
        this.#button.style.pointerEvents = "none";
        this.#button.addEventListener("click", this.#boundButtonClickHandler);
    }

    async #sendForm()
    {
        if( this.#path === "" )
        {
            throw new Error("AxialLoginForm.path is not defined");
        }

        try
        {
            const infos = { email: this.#email.value, password: this.#password.value };
            const response = await fetch(this.#path, { method: "POST", mode:"cors", body: JSON.stringify(infos), headers: { "Content-Type":"application/json" } } );
            const json = await response.json();
            
            if( json && json.status == "ok" &&json.message == "connected" )
            {
                window.location.href = "../admin";
            }

        }
        catch( err )
        {
            console.log(err);
        }
        finally
        {
            this.#clearForm();
            
        }
    }
}

window.customElements.define("axial-login-form", AxialLoginForm);
export { AxialLoginForm }
