"use strict"

import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialTogglePasswordButton } from "../admin/button/AxialTogglePasswordButton.js";

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

    /** @type { AxialServiceButton } */
    #button;

    /** @type { Array<HTMLInputElement> } */
    #formElements = new Array();

    /// ui utils
    /** @type { AxialTogglePasswordButton } */
    #passwordButton;

    /// events
    /** @type { Function } */
    #boundFocusOutHandler;

    /** @type { Function } */
    #boundButtonClickHandler;

    /** @type { Function } */
    #boundPasswordButtonToggleChangedHandler

    constructor()
    {
        super();
        this.classList.add("axial_login_form");
        this.template = "axial-login-form-template";

        this.#boundFocusOutHandler = this.#focusOutHandler.bind(this);
        this.#boundButtonClickHandler = this.#buttonClickHandler.bind(this);
        this.#boundPasswordButtonToggleChangedHandler =  this.#passwordButtonToggleChangedHandler.bind(this);
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

        this.#path = this.getAttribute("axial-path");

        this.#email = this.shadowRoot.getElementById("email");
        this.#email.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#password = this.shadowRoot.getElementById("password");
        this.#password.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#formElements.push(this.#email, this.#password);

        this.#button = this.shadowRoot.getElementById("button");
        this.#button.addEventListener("click", this.#boundButtonClickHandler);

        this.#passwordButton = this.shadowRoot.getElementById("passwordButton");
        this.#passwordButton.addEventListener("toggleChanged", this.#boundPasswordButtonToggleChangedHandler );
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
            this.#button.enabled = true;
        }
        else
        {
            this.#button.enabled = false;
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #passwordButtonToggleChangedHandler( event )
    {
        if( this.#password )
        {
            this.#passwordButton.selected === true ? this.#password.type = "text": this.#password.type = "password";
        }
    }

    #buttonClickHandler( event )
    {
        this.#button.enabled = false;
        this.#button.loading = true;
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

        this.#button.enabled = false;
        this.#button.loading = false;
    }

    async #sendForm()
    {
        if( this.#path === "" )
        {
            throw new Error("AxialLoginForm.path is not defined");
        }

        const formSendingEvent = new CustomEvent("formSending");
        this.dispatchEvent(formSendingEvent);

        try
        {
            const infos = { email: this.#email.value, password: this.#password.value };
            const response = await fetch(this.#path, { method: "POST", mode:"cors", body: JSON.stringify(infos), headers: { "Content-Type":"application/json" } } );
            const json = await response.json();
            
            if( json )
            {
                const formSentEvent = new CustomEvent("formSent", { detail: { response: json } } );
                this.dispatchEvent(formSentEvent);
            }

        }
        catch( err )
        {
            console.log(err);
            const formErrorEvent = new CustomEvent("formError", { detail: { error: err } } );
            this.dispatchEvent(formErrorEvent);
        }
        finally
        {
            this.#clearForm();
            
        }
    }
}

window.customElements.define("axial-login-form", AxialLoginForm);
export { AxialLoginForm }
